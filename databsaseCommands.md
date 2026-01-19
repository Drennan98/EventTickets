--customer
DROP TABLE IF EXISTS "Customer";
CREATE TABLE "Customer" (
	"id" INTEGER, 
	"first_name" VARCHAR(255), 
	"last_name" VARCHAR(255),
	"email" VARCHAR(255),
	"phone_number" VARCHAR(255),
	"address_1" VARCHAR(255),
	"address_2" VARCHAR(255),
	"address_3" VARCHAR(255),
	"postcode" VARCHAR(255),
PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "Customer"
(first_name, last_name, email, phone_number, address_1, address_2, address_3, postcode)
VALUES
('Laura', 'Murphy', 'laura.murphy@email.com', '0851234567', '12 Main Street', 'Apt 1', 'Dublin', 'D01AA11'),
('James', 'OBrien', 'james.obrien@email.com', '0862345678', '45 River Road', NULL, 'Cork', 'T12BB22'),
('Aoife', 'Kelly', 'aoife.kelly@email.com', '0873456789', '78 Oak Lane', NULL, 'Galway', 'H91CC33'),
('Conor', 'Ryan', 'conor.ryan@email.com', '0894567890', '9 High Street', 'Unit 3', 'Limerick', 'V94DD44'),
('Sarah', 'Byrne', 'sarah.byrne@email.com', '0835678901', '22 Park Avenue', NULL, 'Waterford', 'X91EE55'),
('Mark', 'Doyle', 'mark.doyle@email.com', '0846789012', '101 Seaview', NULL, 'Sligo', 'F91FF66'),
('Niamh', 'Walsh', 'niamh.walsh@email.com', '0857890123', '6 College Road', 'Flat B', 'Maynooth', 'W23GG77'),
('Eoin', 'Fitzgerald', 'eoin.fitz@email.com', '0868901234', '14 Mill Street', NULL, 'Kilkenny', 'R95HH88'),
('Tom', 'Reilly', 'tom.reilly@email.com', '0862223333', '14 Oak Street', NULL, 'Dublin', 'D08AA11'),
('Declan', 'Moore', 'declan.moore@email.com', '0894445555', '22 River View', 'Apartment 5', 'Cork', 'T12BB22');




--Location
DROP TABLE IF EXISTS "Location";
CREATE TABLE "Location" (
	"id"	INTEGER,
	"address"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO 'Location' (address)
VALUES
('3 Arena, Dublin'),
('Opera House, Cork'),
('Town Hall Theatre, Galway'),
('University Concert Hall, Limerick');

--event
DROP TABLE IF EXISTS "Event";
CREATE TABLE "Event" (
	"id"	INTEGER,
	"location_id"	INTEGER,
	"event_type_id"	INTEGER,
	"event_name"	VARCHAR(255),
	"event_date"	DATE,
	"event_time"	TIME,
	"price"	DECIMAL(10, 2),
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "Event"
(location_id, event_type_id, event_name, event_date, event_time, price)
VALUES
(1, 1, 'Rock Night Live', '2026-03-10', '20:00', 45.00),
(1, 3, 'Stand-Up Showcase', '2026-03-15', '19:30', 30.00),
(2, 2, 'Hamlet', '2026-04-02', '18:00', 40.00),
(2, 1, 'Jazz Evening', '2026-04-10', '20:00', 35.00),
(3, 3, 'Comedy Fest', '2026-05-01', '21:00', 25.00),
(3, 2, 'Modern Drama', '2026-05-05', '19:00', 38.00),
(4, 4, 'Tech Conference 2026', '2026-06-12', '09:00', 120.00),
(4, 1, 'Classical Orchestra', '2026-06-18', '20:00', 50.00),
(1, 4, 'Business Summit', '2026-07-01', '10:00', 150.00),
(2, 3, 'Improv Night', '2026-07-10', '20:30', 28.00),
(1, 1, 'Indie Night', '2026-08-10', '20:00', 32.00),
(2, 2, 'Shakespeare Evening', '2026-08-15', '19:00', 45.00),
(3, 3, 'Late Night Comedy', '2026-09-01', '21:30', 28.00);

--order
DROP TABLE IF EXISTS "Order";
CREATE TABLE "Order" (
	"id"	INTEGER,
	"customer_id"	INTEGER,
	"event_id"	INTEGER,
	"order_date"	DATETIME,
	"quantity"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "Order"
(customer_id, event_id, order_date, quantity)
VALUES
(1, 1, '2026-02-01 10:15:00', 2),
(2, 2, '2026-02-05 14:30:00', 1),
(3, 3, '2026-02-10 09:45:00', 4),
(4, 4, '2026-02-12 16:20:00', 2),
(5, 1, '2026-03-01 11:00:00', 1),
(6, 2, '2026-03-05 18:10:00', 2),
(7, 5, '2026-03-10 08:00:00', 3),
(8, 6, '2026-03-15 19:40:00', 1),
(1, 3, '2026-04-01 12:00:00', 2),
(2, 4, '2026-04-03 20:15:00', 3),
(3, 5, '2026-05-02 10:10:00', 2),
(4, 6, '2026-05-04 17:50:00', 1),
(5, 7, '2026-06-01 09:00:00', 1),
(6, 8, '2026-06-05 13:20:00', 2);

--Event Type
DROP TABLE IF EXISTS "Event_Type"
CREATE TABLE "Event_Type" (
	"id"	INTEGER,
	"event_type"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);


INSERT INTO 'Event_Type' (event_type)
VALUES
('Concert'),
('Theatre'),
('Comedy'),
('Conference');
