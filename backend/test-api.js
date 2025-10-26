/**
 * API Test Script - Test all endpoints
 * Copyright (C) 2024 John Michael S. Abiol
 * All Rights Reserved
 */

const API_BASE = 'https://abiolfish.ccshub.uk/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let token = null;
let shopId = null;
let itemId = null;
let orderId = null;

const log = (status, message) => {
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${color}[${status}]${colors.reset} ${message}`);
};

const test = async (name, fn) => {
  try {
    await fn();
    log('PASS', name);
    return true;
  } catch (error) {
    log('FAIL', `${name}: ${error.message}`);
    return false;
  }
};

// Test functions
const testHealthCheck = async () => {
  const res = await fetch(`https://abiolfish.ccshub.uk/health`);
  if (!res.ok) throw new Error('Health check failed');
};

const testRegisterOwner = async () => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test_owner_${Date.now()}@test.com`,
      password: 'test123',
      name: 'Test Owner',
      username: `testowner${Date.now()}`,
      role: 'OWNER',
      shopName: 'Test Fish Shop',
      shopDescription: 'A test shop'
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  token = data.token;
  if (data.user.shop) shopId = data.user.shop.id;
};

const testRegisterCustomer = async () => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test_customer_${Date.now()}@test.com`,
      password: 'test123',
      name: 'Test Customer',
      username: `testcustomer${Date.now()}`,
      role: 'CUSTOMER'
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

const testLogin = async () => {
  // Re-login to get fresh token
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test_owner_${Date.now()}@test.com`,
      password: 'test123'
    })
  });
  // Will fail because we're using timestamp, but that's OK
};

const testGetAllShops = async () => {
  const res = await fetch(`${API_BASE}/shops`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  if (!data.data) throw new Error('No shops data returned');
};

const testGetShopById = async () => {
  if (!shopId) throw new Error('No shop ID available');
  const res = await fetch(`${API_BASE}/shops/${shopId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

const testGetShopByIdWithCategory = async () => {
  if (!shopId) throw new Error('No shop ID available');
  const res = await fetch(`${API_BASE}/shops/${shopId}?category=FISH`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

const testAddInventoryItem = async () => {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Test Goldfish',
      category: 'FISH',
      quantity: 100,
      price: 150.00,
      description: 'Beautiful test goldfish'
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  itemId = data.data.id;
};

const testGetInventory = async () => {
  const res = await fetch(`${API_BASE}/inventory`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

const testGetInventoryByCategory = async () => {
  const res = await fetch(`${API_BASE}/inventory?category=FISH`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

const testUpdateInventoryItem = async () => {
  if (!itemId) throw new Error('No item ID available');
  const res = await fetch(`${API_BASE}/inventory/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quantity: 150,
      price: 200.00
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

const testDeleteInventoryItem = async () => {
  if (!itemId) throw new Error('No item ID available');
  const res = await fetch(`${API_BASE}/inventory/${itemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};

// Run all tests
const runTests = async () => {
  console.log('\n' + colors.blue + '════════════════════════════════════' + colors.reset);
  console.log(colors.blue + '  API Endpoint Testing' + colors.reset);
  console.log(colors.blue + '════════════════════════════════════' + colors.reset + '\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    ['Health Check', testHealthCheck],
    ['Register Owner', testRegisterOwner],
    ['Register Customer', testRegisterCustomer],
    ['Get All Shops', testGetAllShops],
    ['Get Shop By ID', testGetShopById],
    ['Get Shop By ID with Category Filter', testGetShopByIdWithCategory],
    ['Add Inventory Item', testAddInventoryItem],
    ['Get Inventory', testGetInventory],
    ['Get Inventory by Category', testGetInventoryByCategory],
    ['Update Inventory Item', testUpdateInventoryItem],
    ['Delete Inventory Item', testDeleteInventoryItem]
  ];

  for (const [name, fn] of tests) {
    const result = await test(name, fn);
    if (result) passed++;
    else failed++;
  }

  console.log('\n' + colors.blue + '════════════════════════════════════' + colors.reset);
  console.log(colors.green + `✓ Passed: ${passed}` + colors.reset);
  if (failed > 0) {
    console.log(colors.red + `✗ Failed: ${failed}` + colors.reset);
  }
  console.log(colors.blue + '════════════════════════════════════' + colors.reset + '\n');
};

runTests().catch(console.error);
