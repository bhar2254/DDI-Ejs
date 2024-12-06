--	setup.sql
--	MySQL Database setup for PhiLambdaPhi.org

--
--	Database: `prod`
--

--
--	Table structure for table `users`
--
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,      -- Numeric ID for internal use,
    `guid` CHAR(36) NOT NULL DEFAULT (UUID()), -- GUID for unique player identification
    `sid` VARCHAR(255) UNIQUE,
    `role` INT NOT NULL DEFAULT 1,                     -- Role for administration
    `username` VARCHAR(50) NOT NULL UNIQUE,   -- Player's username
    `email` VARCHAR(255) NOT NULL UNIQUE,     -- Player's email
    `nickname` VARCHAR(255) NOT NULL DEFAULT (''),
    `name` VARCHAR(255) NOT NULL DEFAULT (''),
    `picture` VARCHAR(255) NOT NULL DEFAULT (''),
    `email_verified` VARCHAR(6) NOT NULL DEFAULT (false),
    `sub` VARCHAR(255) UNIQUE,
    `phone` VARCHAR(20) DEFAULT '',
    `street_address` VARCHAR(100) DEFAULT '',
    `city` VARCHAR(50) DEFAULT '',
    `state` VARCHAR(20) DEFAULT '',
    `postal_code` VARCHAR(20) DEFAULT '',
    `job_title` VARCHAR(50) DEFAULT '',
    `department` VARCHAR(50) DEFAULT '',
    `company_name` VARCHAR(100) DEFAULT '',
    `bio` TEXT DEFAULT NULL,
    `in_directory` TINYINT DEFAULT 2,  -- Visibility levels 0-3
    `chapter_id` INT DEFAULT 2,  -- Foreign key reference
    `order_level` TINYINT DEFAULT 0 CHECK (order_level BETWEEN 0 AND 4),
    `grad_term` ENUM('WI','SP','SU','FA') DEFAULT 'SP',
    `grad_year` INT DEFAULT 2023 CHECK (grad_year > 1968),
    `recruit_term` ENUM('WI','SP','SU','FA') DEFAULT 'FA',
    `recruit_year` INT DEFAULT 1969 CHECK (recruit_year > 1968),
    `brother_big_id` INT DEFAULT NULL,
    `brother_little_id` INT DEFAULT NULL,
    `status` ENUM('Requested', 'Active', 'Archived') DEFAULT 'Requested',
    `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`brother_big_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`brother_little_id`) REFERENCES `users`(`id`)
);


--
--	Table structure for table `chapters`
--

CREATE TABLE `chapters` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `name` VARCHAR(255) NULL,
    `nickname` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `email` VARCHAR(255) UNIQUE,  -- Ensures no duplicate emails
    `description` VARCHAR(255) NULL,
    `campus` VARCHAR(255) NULL,
    `campus_address` VARCHAR(255) NULL,
    `map_link` TEXT DEFAULT NULL,
    `map_embed` TEXT DEFAULT NULL,
    `advisor_id` INT DEFAULT NULL,
    FOREIGN KEY (`advisor_id`) REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    INDEX (`advisor_id`),       -- Optimizes queries involving advisor relationships
    INDEX (`campus`)            -- Speeds up queries filtering by campus
);

--
--	Table structure for table `roster`
--	Composite photos should be stored in a file structure that matches the roster data
--		/public/roster/${year}/${txtMembers.name}.jpg
--

CREATE TABLE `roster` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `year` INT NOT NULL CHECK (`year` > 1968),   -- Ensures year is after 1968
    `chapter_id` INT DEFAULT NULL,               -- Foreign key to chapters table
    `user_id` INT DEFAULT NULL,                  -- Foreign key to users table
    `title` VARCHAR(255) DEFAULT '',

    FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX (`chapter_id`),  -- Optimizes lookups by chapter
    INDEX (`user_id`)      -- Optimizes lookups by user
);

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `organizer_id` INT DEFAULT NULL,          -- FK to users.id
    `organization_id` INT DEFAULT NULL,       -- FK to chapters.chapter_id
    `location` VARCHAR(255) DEFAULT '',
    `description` TEXT DEFAULT NULL,
    `short_description` VARCHAR(255) DEFAULT '',
    `tags` VARCHAR(255) DEFAULT '',

    FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `chapters`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX (`organizer_id`),    -- Optimizes lookups by organizer
    INDEX (`organization_id`)  -- Optimizes lookups by organization
);


--
-- Table structure for table `newsletters`
--

CREATE TABLE `newsletters` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `organizer_id` INT DEFAULT NULL,          -- FK to users.id
    `organization_id` INT DEFAULT NULL,       -- FK to chapters.chapter_id
    `description` TEXT DEFAULT NULL,
    `file_path` VARCHAR(255) DEFAULT '',
    `tags` VARCHAR(255) DEFAULT '',

    FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `chapters`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX (`organizer_id`),    -- Optimizes lookups by organizer
    INDEX (`organization_id`)  -- Optimizes lookups by organization
);


--
-- Table structure for table `philanthropy`
--

CREATE TABLE `philanthropy` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `address` VARCHAR(255) DEFAULT '',
    `phone` VARCHAR(20) DEFAULT '',
    `description` TEXT DEFAULT NULL,
    `short_description` VARCHAR(255) DEFAULT '',
    `tags` VARCHAR(255) DEFAULT '',

    INDEX (`name`)  -- Optimizes searches by name
);


--
-- Table structure for table `faq`
--

CREATE TABLE `faq` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `query` VARCHAR(255) DEFAULT '',
    `response` TEXT DEFAULT NULL,
    `short_response` VARCHAR(255) DEFAULT '',  -- A shorter, more concise version of the response
    `tags` VARCHAR(255) DEFAULT '',  -- Added length limit for tags
    
    INDEX (`query`)  -- Optimizes searches by query text
);

--
-- Table structure for table `tblPayments`
--

CREATE TABLE `payments` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `invoice_id` INT DEFAULT NULL,  -- FK to tblInvoices.intInvoiceId
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `description` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255) for more efficient storage
    `format` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255)
    `tags` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255)
    `value` DECIMAL(20, 2) DEFAULT NULL,  -- Ensure precision and scale for monetary values

    INDEX (`invoice_id`)  -- Added index for better performance on queries filtering by invoice_id
);

--
-- Table structure for table `tblInvoices`
--

CREATE TABLE `invoices` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `due_date` DATETIME DEFAULT NULL,
    `title` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255) for more efficient storage
    `description` VARCHAR(255) DEFAULT '',  -- Kept as TEXT for potentially longer content
    `short_description` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255) for more efficient storage
    `tags` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255)
    `status` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255)
    `value` DECIMAL(20, 2) DEFAULT NULL,  -- Ensure precision and scale for monetary values

    INDEX (`status`)  -- Index added for better performance on status-based queries
);

--
-- Table structure for table `tblHistory`
--

CREATE TABLE `history` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `year` INT DEFAULT NULL CHECK (`year` > 1968),  -- Ensure the year is greater than 1968
    `title` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255) for better performance and storage
    `description` VARCHAR(255) DEFAULT '',  -- Kept as TEXT for longer descriptions
    `short_description` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255)
    `tags` VARCHAR(255) DEFAULT NULL,  -- Shortened to VARCHAR(255)

    INDEX (`year`)  -- Added an index on the year for better query performance
);

--
-- Table structure for table `tblSQLHistory`
--

CREATE TABLE `sql_history` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
    `timestamp` DATETIME DEFAULT NULL,
    `saved_record` VARCHAR(255) DEFAULT '',  -- Kept as TEXT for longer saved records
    `update_table` VARCHAR(255) DEFAULT '',  -- Shortened to VARCHAR(255) for better performance
    `update_user_id` INT DEFAULT NULL,
    `update_display` VARCHAR(255) DEFAULT '',  -- Kept as TEXT for potential longer display messages
    
    INDEX (`update_user_id`)  -- Index added for performance on queries filtering by user
);




--
--	Table structure and initial values for table `tblEnv`
--

CREATE TABLE `env` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guid` VARCHAR(36) NOT NULL DEFAULT (UUID()),
    `key` TEXT DEFAULT (''),  -- `txtKey` is now `key`
    `value` TEXT DEFAULT (''),  -- `txtValue` is now `value`
    `type` TEXT DEFAULT ('')  -- `txtType` is now `type`
);

INSERT INTO `env` (`key`, `value`, `type`) VALUES
	("title","Devil's Dive Luthiers","text"),
	("subtitle","Quality Instruments Made by Hand","text"),
	("uri","https://devilsdive.net/","text"),
	("tagline","Building a Better Brotherhood<br>One Man at a Time","text"),
	("orders","[\"Default\",\"Neo-Phi\",\"Lambda\",\"Phi\",\"Alumni\"]","arr"),
	("inDirectory","[\"Invisible\",\"Name Only\",\"Name+Active Dates\",\"All Info\"]","arr"),
	("states","[\"AL\",\"AK\",\"AS\",\"AZ\",\"AR\",\"CA\",\"CO\",\"CT\",\"DE\",\"DC\",\"FM\",\"FL\",\"GA\",\"GU\",\"HI\",\"ID\",\"IL\",\"IN\",\"IA\",\"KS\",\"KY\",\"LA\",\"ME\",\"MH\",\"MD\",\"MA\",\"MI\",\"MN\",\"MS\",\"MO\",\"MT\",\"NE\",\"NV\",\"NH\",\"NJ\",\"NM\",\"NY\",\"NC\",\"ND\",\"MP\",\"OH\",\"OK\",\"OR\",\"PW\",\"PA\",\"PR\",\"RI\",\"SC\",\"SD\",\"TN\",\"TX\",\"UT\",\"VT\",\"VI\",\"VA\",\"WA\",\"WV\",\"WI\",\"WY\"]","arr"),
	("terms","[\"WI\",\"SP\",\"SU\",\"FA\"]","arr"),
	("roles","[\"System\",\"Standard\",\"Brother\",\"Executive\",\"Super\"]","arr"),
	("status","[\"System\",\"Inactive\",\"Requested\",\"Invited\",\"Active\"]","arr"),
	("forms","{
	\"id\":{\"name\":\"id\",\"format\":\"input\",\"type\":\"number\",\"label\":\"User Id\"},
	\"role\":{\"name\":\"role\",\"format\":\"select\",\"type\":\"select\",\"label\":\"Role\"},
	\"email\":{\"name\":\"email\",\"format\":\"input\",\"type\":\"text\",\"label\":\"E-Mail\"},
	\"chapter_id\":{\"name\":\"chapter_id\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Chapter\"},
	\"name\":{\"name\":\"name\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Chapter\"},
	\"order\":{\"name\":\"order\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Order\"},
	\"recruit_year\":{\"name\":\"recruit_year\",\"format\":\"input\",\"type\":\"text\",\"label\":\"R. Year\"},
	\"recruit_term\":{\"name\":\"recruit_term\",\"format\":\"select\",\"type\":\"select\",\"label\":\"R. Term\"},
	\"grad_year\":{\"name\":\"grad_year\",\"format\":\"input\",\"type\":\"text\",\"label\":\"A. Year\"},
	\"grad_term\":{\"name\":\"grad_term\",\"format\":\"select\",\"type\":\"select\",\"label\":\"A. Term\"},
	\"nickname\":{\"name\":\"nickname\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Display Name\"},
	\"short_description\":{\"name\":\"short_description\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Description\"},
	\"organizer_id\":{\"name\":\"organizer_id\",\"format\":\"input\",\"type\":\"number\",\"label\":\"Organizer\"},
	\"organization_id\":{\"name\":\"organization_id\",\"format\":\"input\",\"type\":\"number\",\"label\":\"Chapter\"},
	\"title\":{\"name\":\"title\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Title\"},
	\"status\":{\"name\":\"status\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Status\"},
	\"timestamp\":{\"name\":\"timestamp\",\"format\":\"input\",\"type\":\"datetime-local\",\"label\":\"Timestamp\"},
	\"query\":{\"name\":\"query\",\"format\":\"input\",\"type\":\"text\",\"label\":\"Question\"},
	\"year\":{\"name\":\"year\",\"format\":\"input\",\"type\":\"number\",\"label\":\"Roster Year\"}
}","obj");
	
--	,\"\":{\"name\":\"\",\"format\":\"input\",\"type\":\"text\",\"label\":\"\"}
