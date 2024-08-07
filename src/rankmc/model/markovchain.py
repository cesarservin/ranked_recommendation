import numpy as np
import pandas as pd
import scipy as sp


def prepare_df_for_sparse_matrix(df: pd.DataFrame, col_id: str, col_shift: str, df_index: pd.DataFrame) -> pd.DataFrame:
    """Prepare the dataframe for the sparse matrix construction applying equal weights to all transitions
    within the same product combination

    Args:
        df (pd.DataFrame): dataframe with the data with groups and ids columns
        col_id (str): column name of the group
        col_shift (str): column name of the id shifted
        df_index (pd.DataFrame): the dataframe with the index and the id

    Returns:
        pd.DataFrame: dataframe with the data ready for the sparse matrix construction
    """

    # 1. Create a column of the next ordered products within orders

    # Add a new column 'Shifted_Product_ID' with the Product_ID shifted by one within each group of Order_ID
    df_shift = df.copy()
    # new column is float64 due to the fact we have NAN for the last products in an order like index 8
    df_shift["shifted_id"] = df_shift.groupby(col_id)[col_shift].shift(-1)

    # 2. Generate and add index to current products for matrix construction

    df_shift = df_shift.merge(df_index[[col_shift, "index"]], on=col_shift, how="left")
    df_shift = df_shift.merge(
        df_index[[col_shift, "index"]], left_on="shifted_id", right_on=col_shift, how="left", indicator=True
    )

    # 3. Remove last rows of each order
    # Since our last product added to the cart has no transition product to go to in the network. We will remove those
    # rows which are all the rows where they are left_only
    df_shift = df_shift[df_shift["_merge"] != "left_only"]

    # 4. Generate edge weights or probabilities

    # test with filter data
    # df_shift = df_shift.loc[(df_shift['index_x']==33) | (df_shift['index_x']==0)]

    # generates the count of all with the same initial transition
    outdegrees = df_shift[["index_x", "index_y"]].groupby("index_x", as_index=False).count()

    # renames columns and merges data into new dataframe
    outdegrees.rename(columns={"index_y": "OUTDEGREE"}, inplace=True)
    segments = df_shift.merge(outdegrees, on="index_x", how="left")

    # generates equal weights for all transitions withing the same product combination
    segments["WEIGHT"] = 1.0 / segments["OUTDEGREE"]

    return segments


def create_sparse_matrix(df: pd.DataFrame, df_index: pd.DataFrame) -> tuple[sp.sparse.csr_matrix, np.ndarray]:
    """Create a sparse matrix from the dataframe

    Args:
        df (pd.DataFrame): prepared dataframe for the sparse matrix construction
        df_index (pd.DataFrame): prepared dataframe with the index and the id

    Returns:
        sp.sparse.csr_matrix: sparse matrix with the data
    """
    import scipy as sp

    n = df_index.index.max() + 1

    # Create a sparse matrix with n x n dimensions
    matrix = sp.sparse.csr_matrix((df["WEIGHT"], (df["index_x"], df["index_y"])), shape=(n, n))

    return matrix, n


def init_state_mc(df: pd.DataFrame, n: int) -> np.ndarray:
    """generate the initial state for the markov chain based on the number of ids from the dataframe

    Args:
        df (pd.DataFrame): prepared dataframe
        n (int): number of ids from id table

    Returns:
        np.ndarray: initial state for the markov chain
    """
    # create np array of n size based on id table
    x0 = np.zeros(n)
    # store indexes to calculate probability of acutual ids been used
    actual_id_indices = df["index_x"].unique()
    # assign an equal probability to purchasing any product in the list
    x0[actual_id_indices] = 1.0 / n
    return x0


def eval_markov_chain(matrix: sp.sparse.csr_matrix, x0: np.ndarray, t_max: int) -> tuple[np.ndarray, np.ndarray]:
    tv_distances = np.zeros(t_max)

    x = x0.copy()
    for i in range(t_max):
        tv_distances[i] = 0.5 * np.sum(np.abs(x - x0))
        x = matrix.T.dot(x0)

    return x, tv_distances


def create_mc_df(x: np.ndarray, df_index: pd.DataFrame) -> pd.DataFrame:
    """creates a dataframe with the probability of each product to generate a rank dataframe

    Args:
        x (np.ndarray): steady state probabilities of the markov chain
        df_index (pd.DataFrame): dataframe with the index and the id

    Returns:
        pd.DataFrame: ranked dataframe of the products based on markov chain probabilities
    """

    # Sort the products by their probability to generate rank
    ranks = np.argsort(-x)
    # generate dictionary to create dataframe
    mc = {"index": ranks, "ss_prob": x[ranks], "rank": range(1, len(ranks) + 1)}
    df_mc = pd.DataFrame(mc)
    df_mc = df_mc.merge(df_index, on="index", how="left")

    return df_mc
