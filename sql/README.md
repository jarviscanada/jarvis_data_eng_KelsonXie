# Introduction

# SQL Queries
```sql
CREATE TABLE cd.members (
  memid INTEGER PRIMARY KEY, 
  surname VARCHAR(200) NOT NULL, 
  firstname VARCHAR(200) NOT NULL, 
  address VARCHAR(300) NOT NULL, 
  zipcode INTEGER NOT NULL, 
  telephone VARCHAR(20) NOT NULL, 
  recommendedby INTEGER, 
  joindate TIMESTAMP NOT NULL, 
  CONSTRAINT fk_recommendedby FOREIGN KEY (recommendedby) REFERENCES cd.members(memid)
);
```

```sql
CREATE TABLE cd.bookings (
  bookid INTEGER PRIMARY KEY, 
  facid INTEGER NOT NULL, 
  memid INTEGER NOT NULL, 
  starttime TIMESTAMP NOT NULL, 
  slots INTEGER NOT NULL CONSTRAINT fk_facid FOREIGN KEY (facid) REFERENCES cd.facilities(facid), 
  CONSTRAINT fk_memid FOREIGN KEY (memid) REFERENCES cd.members(memid)
);
```

```sql
CREATE TABLE cd.facilities (
  facid INTEGER PRIMARY KEY, 
  name VARCHAR(100) NOT NULL, 
  membercost NUMERIC NOT NULL, 
  guestcost NUMERIC NOT NULL, 
  initialoutlay NUMERIC NOT NULL, 
  monthlymaintenance NUMERIC NOT NULL
);
```
###### Table Setup (DDL)

###### Question 1: Insert Data into a Table

```sql
INSERT INTO cd.facilities 
VALUES 
  (9, 'Spa', 20, 30, 100000, 800);
```

###### Question 2: Insert Calculated Data into a Table

```sql
INSERT INTO cd.facilities 
VALUES 
  (
    (
      SELECT 
        max(facid) 
      FROM 
        cd.facilities
    )+ 1, 
    'Spa', 
    20, 
    30, 
    100000, 
    800
  );
```

###### Question 3: Update Existing Data

```sql
UPDATE 
  cd.facilities 
SET 
  initialoutlay = 10000 
WHERE 
  name = 'Tennis Court 2';
```

###### Question 4: Update Row Based on the Contents of Another Row

```sql
UPDATE 
  cd.facilities 
SET 
  membercost = (
    SELECT 
      membercost 
    FROM 
      cd.facilities 
    WHERE 
      name = 'Tennis Court 1'
  )* 1.1, 
  guestcost = (
    SELECT 
      guestcost 
    FROM 
      cd.facilities 
    WHERE 
      name = 'Tennis Court 1'
  )* 1.1 
WHERE 
  name = 'Tennis Court 2';
```


###### Question 5: Delete All Bookings

```sql
EXPLAIN ANALYZE 
SELECT 
  * 
FROM 
  cd.bookings 
WHERE 
  memid = 1;
```

###### Question 6: Delete a Member from the cd.members Table

```sql
DELETE FROM 
  cd.members 
WHERE 
  memid = 37;
```

###### Question 7: Control Which Rows are Retrieved

```sql
SELECT 
  facid, 
  name, 
  membercost, 
  monthlymaintenance 
FROM 
  cd.facilities 
WHERE 
  membercost > 0 
  AND membercost < (monthlymaintenance / 50);
```


###### Question 8: Basic String Searches

```sql
SELECT 
  * 
FROM 
  cd.facilities 
WHERE 
  name LIKE '%Tennis%';
```

###### Question 9: Matching Against Multiple Possible Values

```sql
SELECT 
  * 
FROM 
  cd.facilities 
WHERE 
  facid in (1, 5);
```

###### Question 10: Working with Dates

```sql
SELECT 
  memid, 
  surname, 
  firstname, 
  joindate 
FROM 
  cd.members 
WHERE 
  joindate >= '2012-09-01';
```

###### Question 11: Combining Results from Multiple Queries

```sql
SELECT 
  surname 
FROM 
  cd.members 
UNION 
SELECT 
  name 
FROM 
  cd.facilities;
```

###### Question 12: Retrieve the Start Times of Members' Bookings

```sql
SELECT 
  b.starttime 
FROM 
  cd.bookings b 
  INNER JOIN cd.members m ON b.memid = m.memid 
WHERE 
  m.firstname = 'David' 
  AND m.surname = 'Farrell';
```

###### Question 13: Work out the Start Times of Bookings for Tennis Courts

```sql
SELECT 
  b.starttime AS start, 
  f.name 
FROM 
  cd.bookings b 
  INNER JOIN cd.facilities f ON b.facid = f.facid 
WHERE 
  name LIKE 'Tennis Court%' 
  AND b.starttime >= '2012-09-21' 
  AND b.starttime < '2012-09-22' 
ORDER BY 
  start;
```

###### Question 14: Produce a List of all Members, Along with their Recommender

```sql
SELECT 
  firstname, 
  surname, 
  (
    SELECT 
      firstname 
    FROM 
      cd.members c3 
    WHERE 
      c1.recommendedby = c3.memid
  ), 
  (
    SELECT 
      surname 
    FROM 
      cd.members c2 
    WHERE 
      c1.recommendedby = c2.memid
  ) 
FROM 
  cd.members c1 
ORDER BY 
  2, 
  1;
```

###### Question 15: Produce a List of all Members who have Recommended Another Member

```sql
SELECT 
  DISTINCT m2.firstname, 
  m2.surname 
FROM 
  cd.members m1 
  JOIN cd.members m2 ON m1.recommendedby = m2.memid 
WHERE 
  m1.recommendedby IS NOT NULL 
ORDER BY 
  2, 
  1;
```

###### Question 16: Produce a List of all Members, Along with their Recommender, Using No Joins

```sql
SELECT 
  DISTINCT CONCAT(m1.firstname, ' ', m1.surname), 
  (
    SELECT 
      CONCAT(m2.firstname, ' ', m2.surname) 
    FROM 
      cd.members m2 
    WHERE 
      m1.recommendedby = m2.memid
  ) 
FROM 
  cd.members m1;
```

###### Question 17: Count the Number of Recommendations each Member Makes

```sql
SELECT 
  recommendedby, 
  count(*) 
FROM 
  cd.members 
WHERE 
  recommendedby IS NOT NULL 
GROUP BY 
  recommendedby 
ORDER BY 
  1;
```

###### Question 18: List the Total Slots Booked per Facility

```sql
SELECT 
  f.facid, 
  SUM(b.slots) as "Total Slots" 
FROM 
  cd.bookings b 
  JOIN cd.facilities f ON f.facid = b.facid 
GROUP BY 
  f.facid 
ORDER BY 
  1;
```

###### Question 19: List the Total Slots Booked per Facility in a Given Month

```sql
SELECT 
  facid, 
  SUM(slots) AS "Total Slots" 
FROM 
  cd.bookings 
WHERE 
  starttime >= '2012-09-01' 
  AND starttime < '2012-10-01' 
GROUP BY 
  facid 
ORDER BY 
  2;
```

###### Question 20: List the Total Slots Booked per Facility per Month

```sql
SELECT 
  facid, 
  EXTRACT(
    month 
    from 
      starttime
  ) AS month, 
  SUM(slots) AS "Total Slots" 
FROM 
  cd.bookings 
WHERE 
  EXTRACT(
    year 
    from 
      starttime
  ) = 2012 
GROUP BY 
  facid, 
  month 
ORDER BY 
  facid, 
  month;
```

###### Question 21: Find the Count of Members Who Have Made at Least One Booking

```sql
SELECT 
  COUNT(
    DISTINCT(memid)
  ) 
FROM 
  cd.bookings;
```

###### Question 22: List each Member's First Booking after September 1st 2012

```sql
SELECT 
  m.surname, 
  m.firstname, 
  b.memid, 
  MIN(b.starttime) AS starttime 
FROM 
  cd.bookings b 
  JOIN cd.members m ON b.memid = m.memid 
WHERE 
  b.starttime >= '2012-09-01' 
GROUP BY 
  b.memid, 
  m.firstname, 
  m.surname 
ORDER BY 
  b.memid;
```

###### Question 23: Produce a List of Member Names, with Each Row Containing the Total Member Count

```sql
SELECT 
  COUNT(*) OVER() as COUNT, 
  firstname, 
  surname 
FROM 
  cd.members 
ORDER BY 
  memid;
```

###### Question 24: Produce a Numbered List of Members

```sql
SELECT 
  RANK() OVER(
    ORDER BY 
      joindate
  ), 
  firstname, 
  surname 
FROM 
  cd.members;
```

###### Question 25: Output the Facility Id that has the Highest Number of Slots Booked

```sql
WITH facility_totals AS (
  SELECT 
    facid, 
    SUM(slots) AS total_slots 
  FROM 
    cd.bookings 
  GROUP BY 
    facid
), 
with_max AS (
  SELECT 
    facid, 
    total_slots, 
    MAX(total_slots) OVER () AS max_total_slots 
  FROM 
    facility_totals
) 
SELECT 
  facid, 
  total_slots 
FROM 
  with_max 
WHERE 
  total_slots = max_total_slots;
```

###### Question 26: Format the Names of Members

```sql
SELECT 
  CONCAT(surname, ', ', firstname) 
FROM 
  cd.members;
```

###### Question 27: Find Telephone Numbers with Parentheses

```sql
SELECT 
  memid, 
  telephone 
FROM 
  cd.members 
WHERE 
  telephone LIKE '%(%)%' 
ORDER BY 
  1;
```

###### Question 28: Count the Number of Members Whose Surnames Starts with Each Letter of the Alphabet

```sql
SELECT 
  SUBSTRING(surname, 1, 1) AS LETTER, 
  COUNT(*) 
FROM 
  cd.members 
GROUP BY 
  LETTER 
ORDER BY 
  1;
```
