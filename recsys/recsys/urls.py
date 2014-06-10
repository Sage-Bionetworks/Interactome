#from django.conf.urls.defaults import patterns, include, url
from django.conf.urls import patterns, url, include

from recsys.views import getRecs
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
     url(r'^recs/$', getRecs),
)


