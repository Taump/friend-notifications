CREATE TABLE sent_followup_notifications (
	address1 VARCHAR(50) NOT NULL,
	address2 CHAR(32) NOT NULL,
	reward_number CHAR(4) NOT NULL,
	creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (address1, address2)
);
