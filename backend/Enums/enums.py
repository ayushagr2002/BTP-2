from enum import Enum

class TrainingMode(Enum):
    AUTOML = "Automl"
    CUSTOM = "Custom"

class TrainingObjective(Enum):
    REGRESSION = "Regression"
    CLASSIFICATION = "Classification"

class ClassificationMetrics(Enum):
    Accuracy = "Accuracy"
    AUC = "AUC"
    Precision = "Precision"
    Recall = "Recall"
    F1 = "F1"

class RegressionMetrics(Enum):
    R2 = "R2 Score"
    MAE = "Mean Absolute Error"
    MSE = "Mean Squared Error"
    RMSE = "Root Mean Squared Error"

class Classifiers(Enum):
    LogisticRegression = 'Logistic Regression'
    DecisionTree = 'Decision Tree'
    RandomForest = 'Random Forest'
    AdaBoost = 'Ada Boost'
    SVM = 'SVM'
    NaiveBayes = 'Naive Bayes'
    KNN = 'K Nearest Neighbours'

class Regressors(Enum):
    Ridge = 'Ridge Regression'
    BayesianRidge = 'Bayesian Ridge Regression'
    RandomForestRegressor = 'Random Forest Regressor'
    AdaBoostRegressor = 'AdaBoost Regressor'