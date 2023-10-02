from flask import Flask, Blueprint, jsonify, request
import os
import joblib
import subprocess
import sys
import time
sys.path.append(os.getenv('PROJECT_PATH'))

from mongo import db
collection = db['Model_zoo']

deployModel = Blueprint('deployModel', __name__)
deployed_model_id = None
deployed_model = None

@deployModel.route('/deployModel', methods=['POST'])
def deployModelAPI():
    data = request.get_json()
    model_id = data['model_id']
    process = subprocess.Popen(['gnome-terminal', '--', '/bin/python3', '/home/ayush/BTP-2/backend/functions/hostModel.py'], stdout=subprocess.PIPE)
    while True:
        output = process.stdout.readline()
        if process.poll() is not None:
            break

        if output:
            print(output)
    # try:
    #     process = subprocess.Popen(
    #         ['gnome-terminal', 
    #             '--', 
    #             '/bin/python3', 
    #             # '-u', 
    #             '/home/ayush/BTP-2/backend/functions/hostModel.py'],
    #         check=True, 
    #         # stdin=subprocess.PIPE,
    #         # stdout=subprocess.PIPE,
    #         # stderr=subprocess.PIPE,
    #         )
    #     # time.sleep(5)
    #     # process.wait()
    # except Exception as e:
    #     return {'status': 'error', 'message': 'Model could not be deployed'}
    # finally:
    #     return {'status': 'success', 'message': 'Model deployed successfully', 'endpoint' : 'http://localhost:5000/{model_id}/predict'.format(model_id=model_id)}
    # while True:
    #     output = process.stdout.readline()
    #     if process.poll() is not None:
    #         break

    #     if output:
    #         print(output)
    
    # model_id = data['model_id']
    # trained_model = collection.find_one({'model_id': model_id})
    # model_path = trained_model['saved_model_path']
    # model = joblib.load(model_path)

    # global deployed_model_id
    # global deployed_model

    # deployed_model_id = model_id
    # deployed_model = model
    return {'status': 'success', 'message': 'Model deployed successfully', 'endpoint' : 'http://localhost:5000/{model_id}/predict'.format(model_id=model_id)}

import pandas as pd
@deployModel.route('/<model_id>/predict', methods=['POST'])
def predict(model_id):
    global deployed_model_id
    global deployed_model
    if model_id == deployed_model_id:
        data = request.get_json()
        data = data['data']
        data = pd.DataFrame(data)
        predictions = deployed_model.predict(data)
        return {'predictions': predictions}
    else:
        return {'status': 'error', 'message': 'Model not deployed'}