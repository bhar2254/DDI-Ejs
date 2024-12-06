--	init_data.sql
--	MySQL Database sample roster for PhiLambdaPhi.org

--
--	Database: `prod`
--

--
-- Sample data for table `users`
--

INSERT INTO `users` (`username`,`name`,`role`,`bio`,`email`,`phone`,`in_directory`,`recruit_year`,`grad_year`,`created_time`) VALUES --	0 for Alpha Chapter
	('jtest','John Test', 0,'John Test is the reliable digital pioneer of every system check. From debugging loops to testing databases, he\'s seen it all. Residing in \"localhost,\" John ensures code runs smoothly—or shows where it doesn\'t.  Motto: \“It\’s not a bug; it’s an undocumented feature.\”','jtest@philambdaphi.org','',3,1969,2023,'2022-07-27 2:52:17'),
	('bhar2254','Blaine Harper', 4,'B.S. in Statistics \'20<br>KTRM DJ | Khan Queso Rock Star','bhar2254@gmail.com','',2,2017,2020,'2022-07-27 2:52:18');

--
-- Sample data for table `chapters`
--

INSERT INTO `chapters` (`name`,`nickname`,`address`,`email`,`description`,`campus`,`campus_address`,`map_link`) VALUES 
	('Alumni','Alumni','','alumni@philambdaphi.org','Our alumni chapter was founded in 1969 with the founding of Lambda Chapter of Phi Lambda Chi.','','','https://lambdaalumniassociation.org/'),
	('Eagle Rock',"Devil\'s Dive",'Eagle Rock, MO','alpha@devilsdive.net','Alpha chapter was founded at Eagle Rock in Missouri','Devil\'s Dive Main Campus','Eagle Rock, MO','https://devilsdive.net/'),
	('Gravette','Gravette','Gravette, AR','beta@devilsdive.net','Beta chapter was founded at Gravette in Arkansas','Gravette Campus','Gravette, AR','https://devilsdive.net/');
	
--
-- Sample data for table `roster`
--

INSERT INTO `roster` (`year`,`chapter_id`,`title`,`user_id`) VALUES 
--	2 for Alpha Chapter
	(2019,2,'President',2),
	(2018,2,'President',2)
;
--
--	Sample data for table `events`
--

INSERT INTO `events` (`timestamp`,`title`,`organizer_id`,`organization_id`,`location`,`description`,`short_description`) VALUES 
	('2023-07-20 8:00:00','Hello! Goodbye!',2,2,'Alpha House','Get together in Kirksville to say goodbye to graduating brothers, but hello to a new generation of alumni!','Hangout with brothers in Kirksivlle!'),
	('2023-07-27 16:00:00','Congratulations Mr. & Mrs. Barber!',2,1,'','Congratulations to Brother Colton and his new wife, Paula!','Congratulations to Brother Colton and his new wife, Paula!'),
	('2023-08-17 7:00:00','Truman Week 2023',2,2,'Alpha House','Gather together to welcome returning brothers as we kick off our fall semester.','Welcome Back!'),
	('2023-08-22 7:00:00','Start FA/23',2,2,'Alpha House','So begins the FA/23 semester!','So begins the FA/23 semester!')
;

--
-- Sample data for table `faq`
--

INSERT INTO `faq` (`query`,`response`,`short_response`,`tags`) VALUES 
	("How do I join?","Join our fraternity by visiting our active chapter at Truman State University. Current and prospective students can inquire to join either at the FSL office in the SUB or by contacting <a href=\"mailto:recruitment@philamb.info\">recruitment@philamb.info</a>","",""),
	("Does Phi Lamb Haze?","No! Phi Lambda Phi (at the time, Chi) was one of the first fraternities on campus to outlaw hazing and the only fraternity on campus founded with the goal of eliminating hazing in our member's recruitment.","",""),
	("Why Phi Lamb?","As Phi Lambs we believe in putting our brotherhood, or namely our brothers, first.  We believe that by focusing on the well-being and scholastic success of our members we are better able to serve our members as well as our greater campus community. As a brother of Phi Lamb, you are immediately equal and will get a vote and voice in fraternity affairs.","",""),
	("Why join a fraternity in 2023?","While it's true that fratnerity and sorority life has seen a decline in numbers, especially at TSU, it's important to remember that collegiate men will always sought fraternal experiences. Brotherhood is a bond that transcends time and will always be a necessary part of any collegiate man's journey.","","")
;