import os
import sys
 
path = '/srv/project/WEBSITE'
if path not in sys.path:
    sys.path.insert(0, '/srv/project/recsys')
 
os.environ['DJANGO_SETTINGS_MODULE'] = 'recsys.settings'
 
import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()