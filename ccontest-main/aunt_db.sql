-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 14, 2026 at 04:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aunt_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `position_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','in-progress','completed') NOT NULL DEFAULT 'in-progress',
  `employee_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluations`
--

INSERT INTO `evaluations` (`id`, `period_id`, `employee_id`, `position_name`, `status`, `employee_name`, `created_at`, `updated_at`) VALUES
(3, 6, 18, 'ทั่วไป', 'completed', 'EvaT1', '2026-10-27 08:04:55', '2026-10-27 08:09:37'),
(4, 6, 17, 'ทั่วไป', 'in-progress', 'adminT1', '2026-10-27 08:10:03', '2026-10-27 08:10:03');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_criteria`
--

CREATE TABLE `evaluation_criteria` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `requires_evidence` tinyint(1) NOT NULL DEFAULT 0,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_criteria`
--

INSERT INTO `evaluation_criteria` (`id`, `name`, `description`, `requires_evidence`, `period_start`, `period_end`, `created_at`, `updated_at`) VALUES
(1, 'การประเมินผลการปฏิบัติงาน (Performance Appraisal)', 'คำอธิบาย (Description) และ เกณฑ์การให้คะแนน (Scoring Criteria)', 1, '2025-12-02', '2025-12-15', '2025-12-03 03:49:27', '2025-12-03 08:06:59'),
(6, 'KPI (Key Performance Indicators)', '3 ด้าน ซึ่งจะเน้นการวัดผลที่เป็น ตัวเลข และ จับต้องได้ มากกว่าหัวข้อประเมินพฤติกรรมครับ เหมาะสำหรับการนำไปใช้ในระบบ Web App ที่ต้องการคำนวณคะแนนแบบเป็นรูปธรรม', 0, NULL, NULL, '2025-12-03 08:16:31', '2025-12-03 08:18:03');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_employee_criteria`
--

CREATE TABLE `evaluation_employee_criteria` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `criteria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `evaluation_employee_criteria`
--

INSERT INTO `evaluation_employee_criteria` (`id`, `user_id`, `criteria_id`) VALUES
(26, 3, 1),
(27, 3, 6),
(23, 4, 1),
(24, 5, 1),
(25, 5, 6);

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_periods`
--

CREATE TABLE `evaluation_periods` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','closed') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_periods`
--

INSERT INTO `evaluation_periods` (`id`, `name`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(6, 'รอบการประเมินที่ 1 ', '2026-10-27', '2026-10-28', 'active', '2026-10-27 07:39:51', '2026-10-27 07:39:51');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_scores`
--

CREATE TABLE `evaluation_scores` (
  `id` int(11) NOT NULL,
  `evaluation_id` int(11) NOT NULL,
  `subitem_id` int(11) NOT NULL,
  `self_score` tinyint(4) DEFAULT NULL,
  `supervisor_score` tinyint(4) DEFAULT NULL,
  `document_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_scores`
--

INSERT INTO `evaluation_scores` (`id`, `evaluation_id`, `subitem_id`, `self_score`, `supervisor_score`, `document_url`, `created_at`, `updated_at`) VALUES
(2, 3, 57, 3, 5, NULL, '2026-10-27 08:09:37', '2026-10-27 08:12:00'),
(3, 3, 58, 5, 5, NULL, '2026-10-27 08:09:37', '2026-10-27 08:12:00'),
(4, 3, 59, 1, 5, NULL, '2026-10-27 08:09:37', '2026-10-27 08:12:00'),
(5, 3, 63, 2, 5, NULL, '2026-10-27 08:09:37', '2026-10-27 08:12:00'),
(6, 3, 64, 4, 5, NULL, '2026-10-27 08:09:37', '2026-10-27 08:12:00'),
(7, 3, 65, 3, 5, NULL, '2026-10-27 08:09:37', '2026-10-27 08:12:00');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_subitems`
--

CREATE TABLE `evaluation_subitems` (
  `id` int(11) NOT NULL,
  `criteria_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `item_type` enum('score','document') NOT NULL DEFAULT 'score',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_subitems`
--

INSERT INTO `evaluation_subitems` (`id`, `criteria_id`, `name`, `item_type`, `created_at`, `updated_at`) VALUES
(57, 1, '1. คุณภาพและผลสำเร็จของงาน (Quality & Achievement)', 'score', '2025-12-03 08:06:59', '2025-12-03 08:06:59'),
(58, 1, '2. การแก้ไขปัญหาและความคิดริเริ่ม (Problem Solving & Initiative)', 'score', '2025-12-03 08:06:59', '2025-12-03 08:06:59'),
(59, 1, '3. การทำงานเป็นทีมและการสื่อสาร (Teamwork & Communication)', 'score', '2025-12-03 08:06:59', '2025-12-03 08:06:59'),
(63, 6, '1. การบรรลุเป้าหมายตามยอดที่กำหนด (Achievement of Targets)', 'score', '2025-12-03 08:18:03', '2025-12-03 08:18:03'),
(64, 6, '2. อัตราความถูกต้องของงาน (Quality & Error Rate)', 'score', '2025-12-03 08:18:03', '2025-12-03 08:18:03'),
(65, 6, '3. ความตรงต่อเวลาในการส่งมอบงาน (On-Time Delivery)', 'score', '2025-12-03 08:18:03', '2025-12-03 08:18:03');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `avatar_url` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `email`, `position`, `avatar_url`, `created_at`, `updated_at`) VALUES
(13, 17, 'adminT1', '', '', '', '2026-10-27 07:38:33', '2026-10-27 07:38:33'),
(14, 18, 'EvaT1', '', '', '', '2026-10-27 07:55:26', '2026-10-27 07:55:26'),
(15, 19, 'TeaT1', '', '', '', '2026-10-27 08:11:21', '2026-10-27 08:11:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('user','admin','assessor') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(17, 'adminT1', '$2b$10$F7/bd.I5PWEO.rC0fMGGqu.qJcOBWVwtRNhCLzIFbj0wpLKTiojkG', 'admin'),
(18, 'EvaT1', '$2b$10$keC6gS0TfC6Wj0YFbzG2EuhLfMUG.sySfCkUcs4AndG.zK8iIOWJ6', 'user'),
(19, 'TeaT1', '$2b$10$XM4vD9dvz4W03J/7h5w1/exsaRNnB8.5jZ9hpR0y14NqQwhSjozdy', 'assessor');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_evaluations_period` (`period_id`),
  ADD KEY `fk_evaluations_employee` (`employee_id`);

--
-- Indexes for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation_employee_criteria`
--
ALTER TABLE `evaluation_employee_criteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_employee_criteria` (`user_id`,`criteria_id`);

--
-- Indexes for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation_scores`
--
ALTER TABLE `evaluation_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_scores_evaluation` (`evaluation_id`),
  ADD KEY `fk_scores_subitem` (`subitem_id`);

--
-- Indexes for table `evaluation_subitems`
--
ALTER TABLE `evaluation_subitems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subitems_criteria` (`criteria_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_profile` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `evaluation_employee_criteria`
--
ALTER TABLE `evaluation_employee_criteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `evaluation_scores`
--
ALTER TABLE `evaluation_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `evaluation_subitems`
--
ALTER TABLE `evaluation_subitems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `fk_evaluations_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evaluations_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `evaluation_scores`
--
ALTER TABLE `evaluation_scores`
  ADD CONSTRAINT `fk_scores_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_scores_subitem` FOREIGN KEY (`subitem_id`) REFERENCES `evaluation_subitems` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `evaluation_subitems`
--
ALTER TABLE `evaluation_subitems`
  ADD CONSTRAINT `fk_subitems_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
