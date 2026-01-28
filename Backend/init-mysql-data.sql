-- ============================================
-- MySQL Database Initialization Script
-- Banking Parser Application
-- ============================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS bankingdb;

-- Use the database
USE bankingdb;

-- Note: Tables will be auto-created by Hibernate when you start the application
-- This script is for inserting initial user data AFTER the application has created tables

-- ============================================
-- Initial User Data
-- ============================================
-- Passwords are BCrypt hashed:
-- userA: a123 (ADMIN)
-- userB: b123 (USER)
-- userC: c123 (USER)
-- userD: d123 (USER)
-- userE: e123 (USER)
-- ============================================

-- Clear existing users (optional - uncomment if you want to reset)
-- DELETE FROM user_table;

-- Insert users with hashed passwords
-- Note: Run this AFTER starting your application at least once so tables are created

INSERT INTO user_table (username, password, role) VALUES 
('userA', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
('userB', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr6ELS0jKhPPK4kQD6', 'USER'),
('userC', '$2a$10$oxSJl.keBwxmsMLkcT9lPeAIxfNTPNQxpeywMrF7A3kVszwUTqfTK', 'USER'),
('userD', '$2a$10$UQTkHkHzYq/zK89hJ3fBFuIrDJXfLUJW6Lh3eCOG3AHmeLhRUZjNe', 'USER');

-- Note: For userE, it's better to use the signup API endpoint to ensure proper password hashing
-- Or generate a new BCrypt hash

-- ============================================
-- Verification Queries
-- ============================================

-- View all users
SELECT user_id, username, role FROM user_table;

-- Count users by role
SELECT role, COUNT(*) as count FROM user_table GROUP BY role;

-- ============================================
-- How to use this script:
-- ============================================
-- 
-- Option 1: MySQL Workbench
-- 1. Open MySQL Workbench
-- 2. Connect to your MySQL server
-- 3. Open this file (File → Open SQL Script)
-- 4. Execute the script (⚡ icon or Ctrl+Shift+Enter)
--
-- Option 2: Terminal
-- mysql -u root -p < init-mysql-data.sql
--
-- ============================================
