echo "***** EXECUTING GIT PULL ON OUR RESEARCH SERVER ***** students"
echo "****"

ssh www.geospaces.org   "cd /var/www/html/SCHASMap; git pull"  
# scp target/*.war   www.geospaces.org:/usr/local/tomcat/webapps


