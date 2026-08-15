INSERT INTO products (sku,name,slug,category,description,price_ugx,stock_quantity,requires_prescription,is_active)
VALUES
('DEMO-PAR-500','Paracetamol 500mg','paracetamol-500mg','Pain Relief','Demo catalogue item. Replace with pharmacy-approved catalogue data.',5000,100,FALSE,TRUE),
('DEMO-VIT-C','Vitamin C 1000mg','vitamin-c-1000mg','Health Supplements','Demo catalogue item. Replace with pharmacy-approved catalogue data.',15000,50,FALSE,TRUE),
('DEMO-PRESC','Prescription Example','prescription-example','Prescription Medicines','Demo item for testing pharmacist review. Not for real sale.',25000,10,TRUE,TRUE)
ON CONFLICT (sku) DO NOTHING;
