#from django.conf.urls.defaults import patterns, include, url
from django.conf.urls import patterns, url, include

from recsys.views import getRecs
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^blog/', include('blog.urls')),
     # url(r'^admin/', include(admin.site.urls)),
     url(r'^recs/$', getRecs),
)



