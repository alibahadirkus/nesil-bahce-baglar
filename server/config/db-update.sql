-- Mevcut tablolara yeni kolonlar ve tablolar ekle

USE nesil_bahce_baglar;

-- Öğrenciler tablosu
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  student_number VARCHAR(50) UNIQUE,
  class_name VARCHAR(50),
  school_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  volunteer_id INT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL,
  INDEX idx_volunteer_id (volunteer_id),
  INDEX idx_student_number (student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ağaçlar tablosu
CREATE TABLE IF NOT EXISTS trees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  tree_name VARCHAR(255) NOT NULL,
  tree_type VARCHAR(100),
  location VARCHAR(500),
  planting_date DATE,
  status ENUM('planted', 'growing', 'mature', 'maintenance') DEFAULT 'planted',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_volunteer_id (volunteer_id),
  INDEX idx_status (status),
  INDEX idx_planting_date (planting_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ağaç bakım aktiviteleri tablosu
CREATE TABLE IF NOT EXISTS tree_care_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tree_id INT NOT NULL,
  activity_type ENUM('watering', 'fertilizing', 'pruning', 'checkup', 'photo', 'growth_update') NOT NULL,
  activity_date DATE NOT NULL,
  description TEXT,
  photo_url VARCHAR(500),
  completed_by ENUM('student', 'volunteer', 'admin') DEFAULT 'student',
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE,
  INDEX idx_tree_id (tree_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_activity_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Öğrenci-Gönüllü eşleştirme geçmişi
CREATE TABLE IF NOT EXISTS student_volunteer_pairings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  tree_id INT NULL,
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  paired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
  FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE SET NULL,
  UNIQUE KEY unique_active_pairing (student_id, volunteer_id, status),
  INDEX idx_student_id (student_id),
  INDEX idx_volunteer_id (volunteer_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS mesajları tablosuna WhatsApp desteği için kolonlar ekle
-- type kolonu yoksa ekle
SET @dbname = DATABASE();
SET @tablename = 'sms_messages';
SET @columnname = 'type';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(\'sms\', \'whatsapp\') DEFAULT \'sms\' AFTER status')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- external_id kolonu yoksa ekle
SET @columnname = 'external_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) NULL AFTER sent_at')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- type kolonu için index ekle (yoksa)
SET @indexname = 'idx_type';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, '(type)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;



