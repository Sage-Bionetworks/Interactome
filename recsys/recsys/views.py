#from django.shortcuts import render
import json
from django.core.context_processors import csrf
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import boto 



# Create your views here.
@csrf_exempt
def getRecs(request):
	print request.body
	return HttpResponse('Success')



