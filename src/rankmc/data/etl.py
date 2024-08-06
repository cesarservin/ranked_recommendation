"""
General ETL process to move from interm to processed file add data to deployed stage
"""

import pandas as pd


def csv_combine_proc(paths: list) -> pd.DataFrame:
    """combines all datasets from the interim stage

    Args:
        paths (list): paths from interim datasets

    Returns:
        pd.DataFrame: combined dataframe
    """
    import datetime

    import pandas as pd

    df = pd.DataFrame()
    for file in paths:
        filename = file.split("\\")[8].split(".")[0]
        print("Folder - " + filename)

        try:
            df_temp = pd.read_csv(file)
            df_temp["Source.Name.Interim"] = filename

            now = datetime.datetime.now(tz=datetime.timezone.utc).strftime("%Y-%m-%d")
            # date ran
            df_temp["proccessed"] = now
            df = pd.concat([df, df_temp], axis=0)

        except pd.errors.EmptyDataError:
            print("Folder " + filename + " is blank. Skipping file.")
    return df


def backup_file(path_csv_deployed: str, dst: str) -> None:
    """copies file for archives

    Args:
        path_csv_deployed (str): path of file to back up
        dst (str): path destination of file to save to
    """
    import shutil

    shutil.copy(path_csv_deployed, dst)


def csv_combine_update_dep(paths: list, path_csv_deployed: str, ref_col: str) -> pd.DataFrame:
    """combines datasets from deployed and processed stage removing
        duplicated files from deployed stage if processed file
        has same file name (considers for updated data in new files).
        CONFIRM file names are the SAME if not it will
        duplicate data.

    Args:
        paths (list): paths from processed datasets
        path_csv_deployed (str): path of deployed dataset
        ref_col (str): reference column to avoid duplicated dated

    Returns:
        pd.DataFrame: combined dataset from processed and existing deployed
    """
    import datetime

    import pandas as pd

    df_deployed = pd.read_csv(path_csv_deployed)

    for file in paths:
        filename = file.split("\\")[8]
        print(filename)

        df_temp = pd.read_csv(file)

        # date ran
        now = datetime.datetime.now(tz=datetime.timezone.utc).strftime("%Y-%m-%d")
        df_temp["deployed"] = now

        # v2
        # removes files with the same file path in deployed
        # if it reuploads it keeps one file (help with updates and duplicated files)
        filenames = df_deployed[ref_col]

        # unique set of deployed file names
        filenames = set(filenames)

        filenames_temp = df_temp[ref_col]

        # unique set of processed file names
        filenames_temp = set(filenames_temp)
        # find matching names
        updated = filenames.intersection(filenames_temp)
        print("Updating ...")
        print(updated)
        # remove matching file names based on the ref_col
        df_deployed = df_deployed.loc[~df_deployed[ref_col].isin(updated)]

        # combine datasets
        df_deployed = pd.concat([df_deployed, df_temp], axis=0)

    return df_deployed


def csv_dep_init(paths: list) -> pd.DataFrame:
    """Initilizes dataset to next stage to deployment from proccessed

    Args:
        paths (list): paths from processed datasets

    Returns:
        pd.DataFrame: dataset from proccessed initialized
    """
    import datetime

    import pandas as pd

    for file in paths:
        filename = file.split("\\")[8]
        print(filename)

        df_temp = pd.read_csv(file)

        # date ran
        now = datetime.datetime.now(tz=datetime.timezone.utc).strftime("%Y-%m-%d")
        df_temp["deployed"] = now

    return df_temp


def datafile_path_finder(file_name: str) -> str:
    """
    Constructs a path by combining the parent directory of the current working directory with the 'data' folder 
    and the provided file name. If no file name is provided, a default path or an empty string can be returned.

    Args:
        file_name (str, optional): The name of the file for which the path is to be determined.

    Returns:
        df_dir (str): The full path to the file, or an indication if no file name was provided.
    """
    import glob
    import os

    main_dir = os.path.dirname(os.getcwd())
    rawdata_dir = os.path.join(main_dir, "data", file_name)
    df_dir = glob.glob(rawdata_dir)[0]
    return df_dir

def stratified_sample(df: pd.DataFrame, col: str, n_samples: int) -> pd.DataFrame:
    """Sample a DataFrame by a column, stratified by the column.

    Args:
        df (dataframe): dataframe to sample
        col (str): column to stratify by
        n_samples (int): number of samples to take

    Returns:
        df (dataframe): sampled dataframe
    """
    import numpy as np

    np.random.seed(42)
    sampled_orders_ids = np.random.choice(df[col].unique(), size=n_samples, replace=False)
    df = df[df[col].isin(sampled_orders_ids)]
    return df
