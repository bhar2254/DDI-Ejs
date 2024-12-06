CREATE USER 'site'@'localhost' IDENTIFIED BY '';
GRANT ALL ON devils_dive_dev.* TO 'site'@'localhost';
GRANT ALL ON devils_dive_prod.* TO 'site'@'localhost';