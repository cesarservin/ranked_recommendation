var __index = {"config":{"lang":["en"],"separator":"[\\s\\-]+","pipeline":["stopWordFilter"]},"docs":[{"location":"index.html","title":"ranked_recommendation","text":""},{"location":"index.html#usage","title":"Usage","text":"<ul> <li>Basic Usage: Run <code>ranked_recommendation.exe</code> or use <code>ranked_recommendation_main.ipynb</code></li> <li>Configuration: Modify pyproject.toml to add or remove packages.</li> </ul>"},{"location":"index.html#data","title":"Data","text":"<ul> <li>Sources: The dataset is \u201cThe Instacart Online Grocery Shopping Dataset 2017\u201d, Accessed from https://www.instacart.com/datasets/grocery-shopping-2017 on 12/3/2023.</li> </ul> <p>The dataset \u201cThe Instacart Online Grocery Shopping Dataset 2017\u201d is an anonymized dataset contains over 3 million grocery orders from more than 200,000 Instacart users. For each user, Instacart provided between 4 and 100 of their orders, with the sequence of products purchased in each order. However, given the restriction of the assignment of 10MB. I have shrinked and modified the size of the dataset.</p> <ul> <li>Structure: Table of key features</li> </ul> <p>Example</p> <p>Input data format</p> <p><pre><code>products\n    product_id\n    product_name\n</code></pre> <pre><code>order_products\n    order_id\n    product_id\n    add_to_cart_order\n    reordered\n</code></pre></p>"},{"location":"index.html#result","title":"Result \u2705","text":"<ul> <li>Findings:</li> <li> <p>Based on both rankings markov chains model and from the initial counts of sales they shown to be similar.    I was expecting the ranking of products to be different, however given that this is smaller dataset the results might change with the extended dataset.</p> </li> <li> <p>Visualizations:</p> </li> <li></li> </ul>"},{"location":"index.html#directory-structure","title":"Directory Structure","text":"<pre><code>.\n\u251c\u2500\u2500 docs &lt;- markdown files for mkdocs\n\u2502   \u2514\u2500\u2500 img &lt;- assets\n\u251c\u2500\u2500 notebooks &lt;- jupyter notebooks for exploratory analysis and explanation\n\u2514\u2500\u2500 src - scripts for processing data eg. transformations, dataset merges etc.\n\u2502\u00a0\u00a0 \u251c\u2500\u2500 data &lt;- loading, saving and modelling your data\n\u2502\u00a0\u00a0 \u251c\u2500\u2500 features &lt;- feature engineering\n\u2502\u00a0\u00a0 \u251c\u2500\u2500 model &lt;- algorithms and models\n\u2502\u00a0\u00a0 \u251c\u2500\u2500 plots &lt;- plots\n\u2502   \u2514\u2500\u2500 utils &lt;- api and other\n\u251c\u2500\u2500 LICENSE &lt;- License\n\u251c\u2500\u2500 mkdocs.yml &lt;- config for mkdocs\n\u251c\u2500\u2500 pyproject.yml &lt;- config project\n\u2514\u2500\u2500 README.md &lt;- README file of the package\n</code></pre>"},{"location":"index.html#contributing","title":"Contributing","text":"<p>To contribute create a PR a use conventional commits</p> <pre><code>fix: &lt;description&gt;\nfeat: &lt;description&gt;\ndocs: &lt;description&gt;\nrefactor: &lt;description&gt;\n</code></pre> <p>License</p> <p>The project is licensed under the MIT License.</p> <p>I hope this is helpful!</p>"},{"location":"data.html","title":"Data","text":""},{"location":"data.html#rankmc.data.etl","title":"<code>rankmc.data.etl</code>","text":"<p>General ETL process to move from interm to processed file add data to deployed stage</p>"},{"location":"data.html#rankmc.data.etl.backup_file","title":"<code>backup_file(path_csv_deployed, dst)</code>","text":"<p>copies file for archives</p> <p>Parameters:</p> Name Type Description Default <code>path_csv_deployed</code> <code>str</code> <p>path of file to back up</p> required <code>dst</code> <code>str</code> <p>path destination of file to save to</p> required Source code in <code>src/rankmc/data/etl.py</code> <pre><code>def backup_file(path_csv_deployed: str, dst: str) -&gt; None:\n    \"\"\"copies file for archives\n\n    Args:\n        path_csv_deployed (str): path of file to back up\n        dst (str): path destination of file to save to\n    \"\"\"\n    import shutil\n\n    shutil.copy(path_csv_deployed, dst)\n</code></pre>"},{"location":"data.html#rankmc.data.etl.csv_combine_proc","title":"<code>csv_combine_proc(paths)</code>","text":"<p>combines all datasets from the interim stage</p> <p>Parameters:</p> Name Type Description Default <code>paths</code> <code>list</code> <p>paths from interim datasets</p> required <p>Returns:</p> Type Description <code>DataFrame</code> <p>pd.DataFrame: combined dataframe</p> Source code in <code>src/rankmc/data/etl.py</code> <pre><code>def csv_combine_proc(paths: list) -&gt; pd.DataFrame:\n    \"\"\"combines all datasets from the interim stage\n\n    Args:\n        paths (list): paths from interim datasets\n\n    Returns:\n        pd.DataFrame: combined dataframe\n    \"\"\"\n    import datetime\n\n    import pandas as pd\n\n    df = pd.DataFrame()\n    for file in paths:\n        filename = file.split(\"\\\\\")[8].split(\".\")[0]\n        print(\"Folder - \" + filename)\n\n        try:\n            df_temp = pd.read_csv(file)\n            df_temp[\"Source.Name.Interim\"] = filename\n\n            now = datetime.datetime.now(tz=datetime.timezone.utc).strftime(\"%Y-%m-%d\")\n            # date ran\n            df_temp[\"proccessed\"] = now\n            df = pd.concat([df, df_temp], axis=0)\n\n        except pd.errors.EmptyDataError:\n            print(\"Folder \" + filename + \" is blank. Skipping file.\")\n    return df\n</code></pre>"},{"location":"data.html#rankmc.data.etl.csv_combine_update_dep","title":"<code>csv_combine_update_dep(paths, path_csv_deployed, ref_col)</code>","text":"<p>combines datasets from deployed and processed stage removing     duplicated files from deployed stage if processed file     has same file name (considers for updated data in new files).     CONFIRM file names are the SAME if not it will     duplicate data.</p> <p>Parameters:</p> Name Type Description Default <code>paths</code> <code>list</code> <p>paths from processed datasets</p> required <code>path_csv_deployed</code> <code>str</code> <p>path of deployed dataset</p> required <code>ref_col</code> <code>str</code> <p>reference column to avoid duplicated dated</p> required <p>Returns:</p> Type Description <code>DataFrame</code> <p>pd.DataFrame: combined dataset from processed and existing deployed</p> Source code in <code>src/rankmc/data/etl.py</code> <pre><code>def csv_combine_update_dep(paths: list, path_csv_deployed: str, ref_col: str) -&gt; pd.DataFrame:\n    \"\"\"combines datasets from deployed and processed stage removing\n        duplicated files from deployed stage if processed file\n        has same file name (considers for updated data in new files).\n        CONFIRM file names are the SAME if not it will\n        duplicate data.\n\n    Args:\n        paths (list): paths from processed datasets\n        path_csv_deployed (str): path of deployed dataset\n        ref_col (str): reference column to avoid duplicated dated\n\n    Returns:\n        pd.DataFrame: combined dataset from processed and existing deployed\n    \"\"\"\n    import datetime\n\n    import pandas as pd\n\n    df_deployed = pd.read_csv(path_csv_deployed)\n\n    for file in paths:\n        filename = file.split(\"\\\\\")[8]\n        print(filename)\n\n        df_temp = pd.read_csv(file)\n\n        # date ran\n        now = datetime.datetime.now(tz=datetime.timezone.utc).strftime(\"%Y-%m-%d\")\n        df_temp[\"deployed\"] = now\n\n        # v2\n        # removes files with the same file path in deployed\n        # if it reuploads it keeps one file (help with updates and duplicated files)\n        filenames = df_deployed[ref_col]\n\n        # unique set of deployed file names\n        filenames = set(filenames)\n\n        filenames_temp = df_temp[ref_col]\n\n        # unique set of processed file names\n        filenames_temp = set(filenames_temp)\n        # find matching names\n        updated = filenames.intersection(filenames_temp)\n        print(\"Updating ...\")\n        print(updated)\n        # remove matching file names based on the ref_col\n        df_deployed = df_deployed.loc[~df_deployed[ref_col].isin(updated)]\n\n        # combine datasets\n        df_deployed = pd.concat([df_deployed, df_temp], axis=0)\n\n    return df_deployed\n</code></pre>"},{"location":"data.html#rankmc.data.etl.csv_dep_init","title":"<code>csv_dep_init(paths)</code>","text":"<p>Initilizes dataset to next stage to deployment from proccessed</p> <p>Parameters:</p> Name Type Description Default <code>paths</code> <code>list</code> <p>paths from processed datasets</p> required <p>Returns:</p> Type Description <code>DataFrame</code> <p>pd.DataFrame: dataset from proccessed initialized</p> Source code in <code>src/rankmc/data/etl.py</code> <pre><code>def csv_dep_init(paths: list) -&gt; pd.DataFrame:\n    \"\"\"Initilizes dataset to next stage to deployment from proccessed\n\n    Args:\n        paths (list): paths from processed datasets\n\n    Returns:\n        pd.DataFrame: dataset from proccessed initialized\n    \"\"\"\n    import datetime\n\n    import pandas as pd\n\n    for file in paths:\n        filename = file.split(\"\\\\\")[8]\n        print(filename)\n\n        df_temp = pd.read_csv(file)\n\n        # date ran\n        now = datetime.datetime.now(tz=datetime.timezone.utc).strftime(\"%Y-%m-%d\")\n        df_temp[\"deployed\"] = now\n\n    return df_temp\n</code></pre>"},{"location":"data.html#rankmc.data.etl.datafile_path_finder","title":"<code>datafile_path_finder(file_name)</code>","text":"<p>Constructs a path by combining the parent directory of the current working directory with the 'data' folder and the provided file name. If no file name is provided, a default path or an empty string can be returned.</p> <p>Parameters:</p> Name Type Description Default <code>file_name</code> <code>str</code> <p>The name of the file for which the path is to be determined.</p> required <p>Returns:</p> Name Type Description <code>df_dir</code> <code>str</code> <p>The full path to the file, or an indication if no file name was provided.</p> Source code in <code>src/rankmc/data/etl.py</code> <pre><code>def datafile_path_finder(file_name: str) -&gt; str:\n    \"\"\"\n    Constructs a path by combining the parent directory of the current working directory with the 'data' folder\n    and the provided file name. If no file name is provided, a default path or an empty string can be returned.\n\n    Args:\n        file_name (str, optional): The name of the file for which the path is to be determined.\n\n    Returns:\n        df_dir (str): The full path to the file, or an indication if no file name was provided.\n    \"\"\"\n    import glob\n    import os\n\n    main_dir = os.path.dirname(os.getcwd())\n    rawdata_dir = os.path.join(main_dir, \"data\", file_name)\n    df_dir = glob.glob(rawdata_dir)[0]\n    return df_dir\n</code></pre>"},{"location":"data.html#rankmc.data.etl.stratified_sample","title":"<code>stratified_sample(df, col, n_samples)</code>","text":"<p>Sample a DataFrame by a column, stratified by the column.</p> <p>Parameters:</p> Name Type Description Default <code>df</code> <code>dataframe</code> <p>dataframe to sample</p> required <code>col</code> <code>str</code> <p>column to stratify by</p> required <code>n_samples</code> <code>int</code> <p>number of samples to take</p> required <p>Returns:</p> Name Type Description <code>df</code> <code>dataframe</code> <p>sampled dataframe</p> Source code in <code>src/rankmc/data/etl.py</code> <pre><code>def stratified_sample(df: pd.DataFrame, col: str, n_samples: int) -&gt; pd.DataFrame:\n    \"\"\"Sample a DataFrame by a column, stratified by the column.\n\n    Args:\n        df (dataframe): dataframe to sample\n        col (str): column to stratify by\n        n_samples (int): number of samples to take\n\n    Returns:\n        df (dataframe): sampled dataframe\n    \"\"\"\n    import numpy as np\n\n    np.random.seed(42)\n    sampled_orders_ids = np.random.choice(df[col].unique(), size=n_samples, replace=False)\n    df = df[df[col].isin(sampled_orders_ids)]\n    return df\n</code></pre>"},{"location":"model.html","title":"Models","text":""},{"location":"model.html#rankmc.model.markovchain","title":"<code>rankmc.model.markovchain</code>","text":""},{"location":"model.html#rankmc.model.markovchain.create_mc_df","title":"<code>create_mc_df(x, df_index)</code>","text":"<p>creates a dataframe with the probability of each product to generate a rank dataframe</p> <p>Parameters:</p> Name Type Description Default <code>x</code> <code>ndarray</code> <p>steady state probabilities of the markov chain</p> required <code>df_index</code> <code>DataFrame</code> <p>dataframe with the index and the id</p> required <p>Returns:</p> Type Description <code>DataFrame</code> <p>pd.DataFrame: ranked dataframe of the products based on markov chain probabilities</p> Source code in <code>src/rankmc/model/markovchain.py</code> <pre><code>def create_mc_df(x: np.ndarray, df_index: pd.DataFrame) -&gt; pd.DataFrame:\n    \"\"\"creates a dataframe with the probability of each product to generate a rank dataframe\n\n    Args:\n        x (np.ndarray): steady state probabilities of the markov chain\n        df_index (pd.DataFrame): dataframe with the index and the id\n\n    Returns:\n        pd.DataFrame: ranked dataframe of the products based on markov chain probabilities\n    \"\"\"\n\n    # Sort the products by their probability to generate rank\n    ranks = np.argsort(-x)\n    # generate dictionary to create dataframe\n    mc = {\"index\": ranks, \"ss_prob\": x[ranks], \"rank\": range(1, len(ranks) + 1)}\n    df_mc = pd.DataFrame(mc)\n    df_mc = df_mc.merge(df_index, on=\"index\", how=\"left\")\n\n    return df_mc\n</code></pre>"},{"location":"model.html#rankmc.model.markovchain.create_sparse_matrix","title":"<code>create_sparse_matrix(df, df_index)</code>","text":"<p>Create a sparse matrix from the dataframe</p> <p>Parameters:</p> Name Type Description Default <code>df</code> <code>DataFrame</code> <p>prepared dataframe for the sparse matrix construction</p> required <code>df_index</code> <code>DataFrame</code> <p>prepared dataframe with the index and the id</p> required <p>Returns:</p> Type Description <code>tuple[csr_matrix, ndarray]</code> <p>sp.sparse.csr_matrix: sparse matrix with the data</p> Source code in <code>src/rankmc/model/markovchain.py</code> <pre><code>def create_sparse_matrix(df: pd.DataFrame, df_index: pd.DataFrame) -&gt; tuple[sp.sparse.csr_matrix, np.ndarray]:\n    \"\"\"Create a sparse matrix from the dataframe\n\n    Args:\n        df (pd.DataFrame): prepared dataframe for the sparse matrix construction\n        df_index (pd.DataFrame): prepared dataframe with the index and the id\n\n    Returns:\n        sp.sparse.csr_matrix: sparse matrix with the data\n    \"\"\"\n    import scipy as sp\n\n    n = df_index.index.max() + 1\n\n    # Create a sparse matrix with n x n dimensions\n    matrix = sp.sparse.csr_matrix((df[\"WEIGHT\"], (df[\"index_x\"], df[\"index_y\"])), shape=(n, n))\n\n    return matrix, n\n</code></pre>"},{"location":"model.html#rankmc.model.markovchain.init_state_mc","title":"<code>init_state_mc(df, n)</code>","text":"<p>generate the initial state for the markov chain based on the number of ids from the dataframe</p> <p>Parameters:</p> Name Type Description Default <code>df</code> <code>DataFrame</code> <p>prepared dataframe</p> required <code>n</code> <code>int</code> <p>number of ids from id table</p> required <p>Returns:</p> Type Description <code>ndarray</code> <p>np.ndarray: initial state for the markov chain</p> Source code in <code>src/rankmc/model/markovchain.py</code> <pre><code>def init_state_mc(df: pd.DataFrame, n: int) -&gt; np.ndarray:\n    \"\"\"generate the initial state for the markov chain based on the number of ids from the dataframe\n\n    Args:\n        df (pd.DataFrame): prepared dataframe\n        n (int): number of ids from id table\n\n    Returns:\n        np.ndarray: initial state for the markov chain\n    \"\"\"\n    # create np array of n size based on id table\n    x0 = np.zeros(n)\n    # store indexes to calculate probability of acutual ids been used\n    actual_id_indices = df[\"index_x\"].unique()\n    # assign an equal probability to purchasing any product in the list\n    x0[actual_id_indices] = 1.0 / n\n    return x0\n</code></pre>"},{"location":"model.html#rankmc.model.markovchain.prepare_df_for_sparse_matrix","title":"<code>prepare_df_for_sparse_matrix(df, col_id, col_shift, df_index)</code>","text":"<p>Prepare the dataframe for the sparse matrix construction applying equal weights to all transitions within the same product combination</p> <p>Parameters:</p> Name Type Description Default <code>df</code> <code>DataFrame</code> <p>dataframe with the data with groups and ids columns</p> required <code>col_id</code> <code>str</code> <p>column name of the group</p> required <code>col_shift</code> <code>str</code> <p>column name of the id shifted</p> required <code>df_index</code> <code>DataFrame</code> <p>the dataframe with the index and the id</p> required <p>Returns:</p> Type Description <code>DataFrame</code> <p>pd.DataFrame: dataframe with the data ready for the sparse matrix construction</p> Source code in <code>src/rankmc/model/markovchain.py</code> <pre><code>def prepare_df_for_sparse_matrix(df: pd.DataFrame, col_id: str, col_shift: str, df_index: pd.DataFrame) -&gt; pd.DataFrame:\n    \"\"\"Prepare the dataframe for the sparse matrix construction applying equal weights to all transitions\n    within the same product combination\n\n    Args:\n        df (pd.DataFrame): dataframe with the data with groups and ids columns\n        col_id (str): column name of the group\n        col_shift (str): column name of the id shifted\n        df_index (pd.DataFrame): the dataframe with the index and the id\n\n    Returns:\n        pd.DataFrame: dataframe with the data ready for the sparse matrix construction\n    \"\"\"\n\n    # 1. Create a column of the next ordered products within orders\n\n    # Add a new column 'Shifted_Product_ID' with the Product_ID shifted by one within each group of Order_ID\n    df_shift = df.copy()\n    # new column is float64 due to the fact we have NAN for the last products in an order like index 8\n    df_shift[\"shifted_id\"] = df_shift.groupby(col_id)[col_shift].shift(-1)\n\n    # 2. Generate and add index to current products for matrix construction\n\n    df_shift = df_shift.merge(df_index[[col_shift, \"index\"]], on=col_shift, how=\"left\")\n    df_shift = df_shift.merge(\n        df_index[[col_shift, \"index\"]], left_on=\"shifted_id\", right_on=col_shift, how=\"left\", indicator=True\n    )\n\n    # 3. Remove last rows of each order\n    # Since our last product added to the cart has no transition product to go to in the network. We will remove those\n    # rows which are all the rows where they are left_only\n    df_shift = df_shift[df_shift[\"_merge\"] != \"left_only\"]\n\n    # 4. Generate edge weights or probabilities\n\n    # test with filter data\n    # df_shift = df_shift.loc[(df_shift['index_x']==33) | (df_shift['index_x']==0)]\n\n    # generates the count of all with the same initial transition\n    outdegrees = df_shift[[\"index_x\", \"index_y\"]].groupby(\"index_x\", as_index=False).count()\n\n    # renames columns and merges data into new dataframe\n    outdegrees.rename(columns={\"index_y\": \"OUTDEGREE\"}, inplace=True)\n    segments = df_shift.merge(outdegrees, on=\"index_x\", how=\"left\")\n\n    # generates equal weights for all transitions withing the same product combination\n    segments[\"WEIGHT\"] = 1.0 / segments[\"OUTDEGREE\"]\n\n    return segments\n</code></pre>"}]}