FROM ubuntu:latest

RUN apt-get update
RUN apt-get -y upgrade

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y git apache2 

# Enable Apache modules
RUN a2enmod rewrite
RUN a2enmod ssl
RUN a2enmod proxy_http
RUN a2enmod proxy_ajp
RUN a2enmod rewrite
RUN a2enmod deflate
RUN a2enmod headers
RUN a2enmod proxy_balancer
RUN a2enmod proxy_connect
RUN a2enmod proxy_html
RUN a2enmod substitute

# Manually set up the apache environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/v$NODE_VERSION/bin:$PATH

COPY ./app/distribute /var/www/html
COPY ./docker/settings /var/www/html

# Copy in the apache2 configuration file
COPY ./docker/apache/apache2.conf /etc/apache2/apache2.conf
COPY ./docker/apache/000-default.conf /etc/apache2/sites-enabled/000-default.conf

EXPOSE 1919
CMD sed -i "s/xAPIEndpoint/$APIEndpoint/g" /var/www/html/settings \
  && sed -i "s/xVersion/$Version/g" /var/www/html/settings \
  && sed -i "s/xMixpanelToken/$MixpanelToken/g" /var/www/html/settings \
  && sed -i "s/xrecaptcha/$recaptcha/g" /var/www/html/settings \
  && sed -i "s/xFB_APP_ID/$FB_APP_ID/g" /var/www/html/settings \
  && sed -i "s/xGA_TRACKING_ID/$GA_TRACKING_ID/g" /var/www/html/settings \
  && /usr/sbin/apache2ctl -D FOREGROUND
