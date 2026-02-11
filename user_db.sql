-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: user_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `community_involvement`
--

DROP TABLE IF EXISTS `community_involvement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_involvement` (
  `involvement_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `org_type_code` varchar(2) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`involvement_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `community_involvement_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `family_members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_involvement`
--

LOCK TABLES `community_involvement` WRITE;
/*!40000 ALTER TABLE `community_involvement` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_involvement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `family_members`
--

DROP TABLE IF EXISTS `family_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `family_members` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `household_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('HH Head','Spouse','Member') NOT NULL,
  `type_of_marriage` varchar(100) DEFAULT NULL,
  `relation_to_head_code` varchar(2) DEFAULT NULL,
  `sex_code` tinyint(4) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status_code` varchar(2) DEFAULT NULL,
  `religion_code` varchar(2) DEFAULT NULL,
  `sacraments_code` varchar(2) DEFAULT NULL,
  `is_studying` tinyint(1) DEFAULT NULL,
  `highest_educ_attainment` varchar(150) DEFAULT NULL,
  `occupation` varchar(150) DEFAULT NULL,
  `status_of_work_code` varchar(2) DEFAULT NULL,
  `fully_immunized_child` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`member_id`),
  KEY `household_id` (`household_id`),
  CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family_members`
--

LOCK TABLES `family_members` WRITE;
/*!40000 ALTER TABLE `family_members` DISABLE KEYS */;
INSERT INTO `family_members` VALUES (1,1,'sdsd','HH Head','12112',NULL,1,50,NULL,'1',NULL,NULL,'High School','Farmer','1',NULL),(2,1,'sdsdsd','HH Head','121212',NULL,2,25,NULL,'1',NULL,NULL,'HS','Farmer','1',NULL),(3,1,'Troy ','HH Head',NULL,'1',1,16,'1','1','2',1,'Senior High','Carpenter','1','1'),(4,2,'sssaaa','HH Head',NULL,NULL,1,NULL,NULL,'1',NULL,NULL,NULL,NULL,'1',NULL),(5,2,'ddasd','HH Head',NULL,NULL,2,NULL,NULL,'1',NULL,NULL,NULL,NULL,'1',NULL);
/*!40000 ALTER TABLE `family_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_conditions`
--

DROP TABLE IF EXISTS `health_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_conditions` (
  `health_id` int(11) NOT NULL AUTO_INCREMENT,
  `household_id` int(11) NOT NULL,
  `common_illness_codes` text DEFAULT NULL,
  `treatment_source_code` varchar(2) DEFAULT NULL,
  `potable_water_source_code` varchar(2) DEFAULT NULL,
  `lighting_source_code` varchar(2) DEFAULT NULL,
  `cooking_source_code` varchar(2) DEFAULT NULL,
  `garbage_disposal_code` varchar(2) DEFAULT NULL,
  `toilet_facility_code` varchar(2) DEFAULT NULL,
  `water_to_toilet_distance_code` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`health_id`),
  KEY `household_id` (`household_id`),
  CONSTRAINT `health_conditions_ibfk_1` FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_conditions`
--

LOCK TABLES `health_conditions` WRITE;
/*!40000 ALTER TABLE `health_conditions` DISABLE KEYS */;
INSERT INTO `health_conditions` VALUES (1,1,'01','01','1','2','2','1','2','1'),(2,2,NULL,NULL,NULL,'1','1','1','1','1');
/*!40000 ALTER TABLE `health_conditions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `households`
--

DROP TABLE IF EXISTS `households`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `households` (
  `household_id` int(11) NOT NULL AUTO_INCREMENT,
  `purok_gimong` varchar(100) NOT NULL,
  `barangay_name` varchar(100) NOT NULL,
  `municipality` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `urban_rural_classification` varchar(50) DEFAULT NULL,
  `mode_of_transportation` varchar(100) DEFAULT NULL,
  `road_structure` varchar(100) DEFAULT NULL,
  `parish_name` varchar(150) DEFAULT NULL,
  `diocese_prelature` varchar(150) DEFAULT NULL,
  `years_residency` int(11) DEFAULT NULL,
  `num_family_members` int(11) DEFAULT NULL,
  `family_structure` varchar(50) DEFAULT NULL,
  `local_dialect` varchar(100) DEFAULT NULL,
  `ethnicity` varchar(100) DEFAULT NULL,
  `missionary_companion` varchar(255) DEFAULT NULL,
  `date_of_listing` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`household_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `households`
--

LOCK TABLES `households` WRITE;
/*!40000 ALTER TABLE `households` DISABLE KEYS */;
INSERT INTO `households` VALUES (1,'3343434','343434','Enrile','Cag','rural','bicycle','roughroad','IDK','grerer',20,2,'Blended','eweewewewewe','wwewee','21212','2026-02-11','2026-02-11 08:19:37'),(2,'3343434ff','343434aaaa','Pamplona','Cagfgf',NULL,NULL,NULL,'IDK','grerer',NULL,NULL,NULL,'eweewewewewe','wwewee',NULL,NULL,'2026-02-11 08:40:20');
/*!40000 ALTER TABLE `households` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socio_economic`
--

DROP TABLE IF EXISTS `socio_economic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socio_economic` (
  `socio_id` int(11) NOT NULL AUTO_INCREMENT,
  `household_id` int(11) NOT NULL,
  `income_monthly_code` varchar(2) DEFAULT NULL,
  `expenses_weekly_code` varchar(2) DEFAULT NULL,
  `has_savings` tinyint(1) DEFAULT NULL,
  `savings_location_code` varchar(2) DEFAULT NULL,
  `house_lot_ownership_code` varchar(2) DEFAULT NULL,
  `house_classification_code` varchar(2) DEFAULT NULL,
  `land_area_hectares` decimal(10,4) DEFAULT NULL,
  `dist_from_church_code` varchar(2) DEFAULT NULL,
  `dist_from_market_code` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`socio_id`),
  KEY `household_id` (`household_id`),
  CONSTRAINT `socio_economic_ibfk_1` FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socio_economic`
--

LOCK TABLES `socio_economic` WRITE;
/*!40000 ALTER TABLE `socio_economic` DISABLE KEYS */;
INSERT INTO `socio_economic` VALUES (1,1,'8','1',1,'2','1','1',200.0000,'1','2'),(2,2,NULL,'1',1,'1','1','1',NULL,'1','1');
/*!40000 ALTER TABLE `socio_economic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'St. Padre Pio of Pietrelcina Parish','2026@Padre_XqLma7!'),(2,'Dana-ili, Immaculate Conception Parish','2026@Danaili_TzRop4#'),(3,'St. Thomas Aquinas Parish','2026@Thomas_KyNed9$'),(4,'St. Philomene Parish','2026@Philomene_JaWux3%'),(5,'Our Lady of Fatima Parish','2026@Fatima_PoRiq8&'),(6,'Our Lady of the Most Holy Rosary Parish','2026@Rosary_LmCaz5*'),(7,'Cordova, St. Vincent Ferrer Parish','2026@Cordova_VeTyn2@'),(8,'St. Peter Gonzales of Thelmo Parish','2026@Peter_SuQel6!'),(9,'Bukig, Mary, Mother of the Church Parish','2026@Bukig_NaMop1#'),(10,'Centro Baggao, St. Dominic de Guzman Parish','2026@Centro_HiZar7$'),(11,'San Jose, St. Joseph the Worker Parish and Shrines','2026@SanJose_WoLem3%'),(12,'Tallang, Our Lady of Peace and Good Voyage Parish','2026@Tallang_RyBic8&'),(13,'Holy Cross Parish','2026@HolyCross_TaQev4*'),(14,'St. Anne Parish','2026@Anne_MuXor9!'),(15,'St. Bartholomew Parish','2026@Bartholomew_LeKip5#'),(16,'St. Hyacinth of Poland Parish','2026@Hyacinth_DoRax2$'),(17,'Dugo, St. Isidore the Farmer Parish','2026@Dugo_ZeTaq6%'),(18,'St. Vincent Ferrer Parish (Camiguin)','2026@Camiguin_KoLur1&'),(19,'St. Vincent Ferrer Parish (Solana)','2026@Solana_ZoNik8$'),(20,'St. Joseph Parish','2026@Joseph_PaNix7*'),(21,'Our Lady of Snows Parish','2026@Snows_YuCem3!'),(22,'St. Catherine of Alexandria Parish','2026@Catherine_RoTas8#'),(23,'St. Roch Parish (Gonzaga)','2026@RochG_BeQul4$'),(24,'San Isidro Labrador Parish Church (Nabaccayan)','2026@IsidroN_SaVem9%'),(25,'St. James the Apostle Parish','2026@James_TiKor2&'),(26,'St. Dominic de Guzman Parish','2026@Dominic_XeRal6*'),(27,'Magapit, Our Lady of the Miraculous Medal Parish','2026@Magapit_LuQon1!'),(28,'San Isidro Labrador Parish (Lasam)','2026@IsidroL_WaTem5#'),(29,'St. Peter the Martyr Parish','2026@PeterM_ZoNik8$'),(30,'St. Dominic de Guzman Parish — Basilica Minore of Our Lady of Piat','2026@Piat_RuXel3%'),(31,'St. Joseph, Husband of Mary Parish','2026@HusbandOfMary_MaQir7&'),(32,'Our Mother of Perpetual Help Parish (Nannarian, Peñablanca)','2026@Nannarian_PoLax2*'),(33,'St. Raymund Peñafort Parish','2026@Raymund_TeZom9!'),(34,'Mauanan, St. Francis of Assisi Parish','2026@Mauanan_KiRup4#'),(35,'Sto. Niño Parish – Archdiocesan Shrine of Sto. Niño','2026@StoNino_SaXet6$'),(36,'Sto. Niño Parish (Faire)','2026@Faire_QoLum1%'),(37,'St. Roch Parish (Sanchez Mira)','2026@RochS_YeTik8&'),(38,'Our Lady of Perpetual Help Parish (Namuac)','2026@Namuac_YeTik8&'),(39,'Holy Family Parish (Gadu, Solana)','2026@Gadu_RaCen5*'),(40,'St. Anthony de Padua Parish','2026@Anthony_VoPex3!'),(41,'Casambalagan, Sts. Peter and Paul Parish','2026@Casambalagan_MiQat7#'),(42,'San Isidro Labrador Parish (Sta. Praxedes)','2026@IsidroP_LeVux2$'),(43,'Sta. Rosa de Lima Parish (under Tuguegarao City)','2026@StaRosa_LeVux2$'),(44,'Our Lady of the Angels Parish','2026@Angels_XoTar9%'),(45,'Holy Guardian Angels Parish','2026@Guardians_PeZal4&'),(46,'Naruangan, San Roque Parish','2026@Naruangan_TuMek6*'),(47,'Annafunan, Sta. Rosa de Lima Parish','2026@Annafunan_LaQir1!'),(48,'Cataggaman, St. Dominic de Guzman Parish','2026@Cataggaman_ZeRop8#'),(49,'Leonarda, Parish of the Divine Mercy of Our Lord Jesus Christ','2026@Leonarda_WiTax3$'),(50,'San Gabriel, Sto. Niño Parish – Archdiocesan Shrine of Sto. Niño','2026@SanGabriel_MoQen7%'),(51,'St. Peter’s Metropolitan Cathedral','2026@Cathedral_RuPax5&'),(52,'Archdiocese of Tuguegarao','2026@Tuguegarao_VuRds5$'),(53,'admin','admin123');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11 18:42:02
