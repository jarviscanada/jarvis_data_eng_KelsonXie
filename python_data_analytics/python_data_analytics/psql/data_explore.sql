-- Show table schema 
\d+ retail;

-- Show first 10 rows
SELECT
  *
FROM
  retail
limit
  10;

-- Check # of records
SELECT
  COUNT(*)
FROM
  public.retail

-- number of clients (e.g. unique client ID)
SELECT
  COUNT(
    DISTINCT(customer_id)
  )
FROM
  public.retail

-- invoice date range (e.g. max/min dates)
SELECT
  MIN(invoice_date),
  MAX(invoice_date)
FROM
  public.retail

-- number of SKU/merchants (unique stock code)
SELECT
  COUNT(
    DISTINCT(stock_code)
  )
FROM
  public.retail

-- Calculate average invoice amount excluding invoices with a negative amount (e.g. cancelled ordered means negative amount)
SELECT
  AVG(invoice_total)
FROM
  (
    SELECT
      SUM(quantity * unit_price) AS invoice_total
    FROM
      public.retail
    WHERE
      quantity > 0
    GROUP BY
      Invoice_no
  )

-- Calculate total revenue
SELECT
  SUM(quantity * unit_price)
FROM
  public.retail

-- Calculate total revenue by YYYYMM
SELECT
  TO_CHAR(invoice_date, 'YYYYMM') AS YYYYMM,
  SUM(quantity * unit_price) AS revenue
FROM
  public.retail
GROUP BY
  YYYYMM
ORDER BY
  1 ASC

