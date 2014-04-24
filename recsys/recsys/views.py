#from django.shortcuts import render
import json
from django.core.context_processors import csrf
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import boto.dynamodb
import sys
import csv
import logging
import argparse
import time



SECRET_KEY_EXCEL_FIELD = 'Secret Access Key'
ACCESS_KEY_EXCEL_FIELD = 'Access Key Id'




# Create your views here.

#this function is essentially the main it maps to the url and calls 
# other functions from here
@csrf_exempt
def getRecs(request):
	limit = 0
	numberOfAbstracts = 0 
	print request.body
	if request.method == 'POST':
		numberofAbstracts = numberOfAbstracts + 1
		abstractList = request.body
		limit = 100 + numberOfAbstracts
		if (numberofAbstracts > 0):
			#connectAWS()
			print numberOfAbstracts
	return HttpResponse("success")
	#limit = request.size


def connectAWS():
	REGION = 'us-west-2'
	try:
		csvfile = open('/Users/henryyogman/Desktop/credentials.csv', 'rU')
		reader = csv.DictReader(csvfile) 
		authLine = reader.next()
		accessKey = authLine[ACCESS_KEY_EXCEL_FIELD]
        #secretKey = authLine[SECRET_KEY_EXCEL_FIELD]
        #dynamoConn = dynamodb2.connect_to_region(REGION, aws_access_key_id=accessKey, aws_secret_access_key=secretKey)
	except Exception, e:
		print(e)
	sys.exit(1)







