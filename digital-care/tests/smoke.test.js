const assert=require('assert');
const {classify,safeResponse}=require('../services/safety');
const {normalizeProduct}=require('../services/catalogue');
assert.equal(classify('What is this product used for?'),'general');
assert.equal(classify('Can I change my dosage?'),'pharmacist');
assert.equal(classify('I have chest pain'),'emergency');
assert.equal(safeResponse('I have chest pain').type,'emergency');
assert.equal(normalizeProduct({name:'Vitamin C',sku:'VIT-C',category:'Supplements',priceUgx:15000,stockQuantity:4}).slug,'vitamin-c');
console.log('Kalidad Digital Care smoke tests passed');
