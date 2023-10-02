from flask import Blueprint, current_app, request
from flask_sse import sse
import time
import subprocess
import sys
import pickle 
import os

trainModelAPIs = Blueprint('trainModel', __name__)

@trainModelAPIs.route('/trainModel', methods=['GET', 'POST'])
def trainModel():
    
    data = request.get_json()
    dataset_id = data['dataset_id']
    model_name = data['model_name']
    target_column = data['target_column']
    objective = data['objective']
    metric_mode = data['metric_mode']
    metric_type = data['metric_type']
    training_mode = data['training_mode']
    model_type = data['model_type']

    # if metric_type.lower() != 'autoselect':
    #     metric_type = data['custom_metric_type']

    if training_mode.lower() == 'automl':
        process_path = os.getenv('PROJECT_PATH') + 'functions/trainModelAutoML.py'
    else:
        process_path = os.getenv('PROJECT_PATH') + 'functions/trainModelCustom.py'
    
    process = subprocess.Popen(['python3', '-u', process_path, dataset_id, model_name, target_column, metric_mode, metric_type, objective, model_type], stderr=subprocess.PIPE, bufsize=1, text=True)
    
    while True:
        output = process.stderr.readline()
        if process.poll() is not None:
            break

        if output:
            status, current_model, progress_percent, estimated_time_left = getTrainingStatusAutoML(output) 
            sse.publish({
                'progress': progress_percent,
                'model': current_model,
                'status': status,
                'estimated_time_left': estimated_time_left
            }, channel='mychannel')

    
    details_path = os.getenv('PROJECT_PATH') + 'Usage/details.pkl'
    with open(details_path, 'rb') as f:
        details = pickle.load(f)
    return details

def getTrainingStatusAutoML(output_str):

    status = 'Loading'
    current_model = 'Initialising'
    progress_percent = 0
    estimated_time_left = 'Calculating'

    if output_str.find('Status: ') != -1:
        status = output_str[output_str.find('Status: ')+8:output_str.find('Current Classifier: ')]
        status = status.strip()
        print(status)

    if output_str.find("Current Classifier: ") != -1:
        current_model = output_str[output_str.find("Current Classifier: ")+20:output_str.find("Processing: ")]
        current_model = current_model.strip()
        print(current_model)

    if output_str.find("Processing: ") != -1:
        progress_percent = output_str[output_str.find("Processing: ")+12:output_str.find("Processing: ")+15]
        progress_percent = int(progress_percent.strip())
        print(progress_percent)

    if output_str.find("<") != -1:
        idx = output_str.find("<")
        time_left = output_str[idx+1:idx+6]
        if time_left[0] == '?':
            estimated_time_left = 'Calculating'
        else:
            estimated_time_left = ''
            if time_left[:2].isdigit() == False:
                estimated_time_left = 'Calculating'
                return status, current_model, progress_percent, estimated_time_left
            
            if int(time_left[:2]) > 0:
                estimated_time_left = str(int(time_left[:2])) + ' mins '
            estimated_time_left += str(int(time_left[3:])) + ' secs'
        print(estimated_time_left)
    
    # if training_mode.lower() != 'automl':
    #     current_model = model_type

    return status, current_model, progress_percent, estimated_time_left
