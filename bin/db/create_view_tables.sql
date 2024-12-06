CREATE OR REPLACE  VIEW `viewChapters` AS
    SELECT 
        chapters.*, 
        users.name AS `advisor_name`
    FROM chapters
    LEFT JOIN users ON chapters.advisor_id = users.id;

CREATE OR REPLACE  VIEW `viewEvents` AS
    SELECT 
        events.*, 
        chapters.name AS `chapter_name`, 
        chapters.address AS `chapter_address`, 
        chapters.campus AS `chapter_campus`, 
        chapters.campus_address AS `chapter_campus_address`, 
        chapters.email AS `chapter_email`, 
        users.name AS `organizer_display_name`, 
        roster.title AS `organizer_title`, 
        users.email AS `organizer_email`
    FROM events 
    LEFT JOIN chapters ON events.organization_id = chapters.id
    LEFT JOIN users ON events.organizer_id = users.id
    LEFT JOIN roster ON roster.user_id = users.id  -- Join with roster table to get user memberships
    ;

CREATE OR REPLACE  VIEW `viewRoster` AS
    SELECT 
        roster.*, 
        chapters.guid AS `chapter_guid`,
        chapters.name AS `chapter_name`, 
        chapters.address AS `chapter_address`, 
        chapters.campus AS `chapter_campus`, 
        chapters.campus_address AS `chapter_campus_address`, 
        chapters.email AS `chapter_email`, 
        roster.title AS `user_title`, 
        roster.year AS `user_year`,
        users.guid AS `user_guid`,
        users.email AS `user_email`,
        users.name AS `user_name`,
        users.recruit_term,
        users.recruit_year,
        users.grad_term,
        users.grad_year,
        users.bio
    FROM roster 
    LEFT JOIN chapters ON roster.chapter_id = chapters.id
    LEFT JOIN users ON roster.user_id = users.id;