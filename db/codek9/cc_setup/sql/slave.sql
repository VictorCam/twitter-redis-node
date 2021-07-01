ALTER USER 'root'@'localhost' IDENTIFIED BY 'root@mariadb';

CREATE USER 'user'@'172.17.0.1' IDENTIFIED BY 'user@mariadb';
GRANT ALL PRIVILEGES on *.* TO 'user'@'172.17.0.1';

-- use the ip / replica pass / log pos from MASTER machine
CHANGE MASTER TO MASTER_HOST='master_IP@mariadb', MASTER_USER='replica', MASTER_PASSWORD='replica_pass@mariadb', MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=logpos@mariadb;

FLUSH PRIVILEGES;

START SLAVE;