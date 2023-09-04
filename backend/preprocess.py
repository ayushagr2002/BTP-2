import pandas as pd
from flask import Blueprint, jsonify, request
from pandas.api.types import is_numeric_dtype

preprocess = Blueprint('preprocess', __name__)

@preprocess.route('/preprocess', methods=['POST'])
def preprocessDataset():
    dataset_name = request.json['name']
    dataset_path = './Datasets/'+dataset_name
    
    # Access finalTasks from request data
    finalTasks = request.json['tasks']
    
    # Read the csv file
    df = pd.read_csv(dataset_path)
    
    # Count number of duplicate rows
    duplicate_rows = df[df.duplicated()]
    num_duplicate_rows = len(duplicate_rows)

    # Perform preprocessing tasks based on finalTasks
    if "Drop Duplicate Rows" in finalTasks:
        df = df.drop_duplicates()
    
    # Count number of interpolated rows
    interpolated_rows = df.isnull().sum()
    num_interpolated_rows = len(interpolated_rows)

    if "Interpolate Missing Values" in finalTasks:
        for column in df.columns:
            if (not is_numeric_dtype(df[column]) and df[column].dtype != 'bool'):
                df[column] = df[column].fillna(df[column].mode()[0])
            else:
                df[column] = df[column].fillna(df[column].mean())

    # Find list of columns normalized
    normalized_columns = []

    
    if "Normalise Features" in finalTasks:
        for column in df.columns:
            if (is_numeric_dtype(df[column]) and df[column].dtype != 'bool'):
                df[column] = (df[column] - df[column].min()) / (df[column].max() - df[column].min())
                normalized_columns.append(column)

    processed_dataset_path = './processedDatasets/' + dataset_name
    df.to_csv(processed_dataset_path, index=False)
    
    return jsonify({'message': 'Preprocessing completed successfully', 
                    'num_duplicate': num_duplicate_rows, 
                    'num_interpolate': num_interpolated_rows, 
                    'normalized_columns': normalized_columns}), 200