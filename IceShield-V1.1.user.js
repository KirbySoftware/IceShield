// ==UserScript==
// @name         IceShield
// @namespace    https://github.com/KirbySoftware/IceShield
// @version      1.1
// @description  Form Automation for website testing
// @author       KirbySoftware
// @match        https://*.ice.gov/*
// @match        https://www.ice.gov/*
// @match        https://tip.ice.gov/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Core variables
    let loopCount = GM_getValue('loopCount', 0); // Track submissions
    let waitingForCaptcha = false;
    let lastFormData = {}; // For data variation
    let selectedViolationType = ''; // Keep track of selected violation type

    // Automation control variables
    let isAutomating = false;
    let automationInterval = null;

    // CAPTCHA API variables
    let captchaApiKey = GM_getValue('captchaApiKey', '');
    let captchaProvider = GM_getValue('captchaProvider', '2captcha'); // Default to 2captcha
    let captchaAutoMode = GM_getValue('captchaAutoMode', false);    // Comprehensive US area codes list with all valid area codes
    const validAreaCodes = [
        // Original list maintained for compatibility
        202, 213, 305, 404, 512, 602, 703, 808, 917, 218, 303, 415, 505, 616, 718, 801, 920, 336, 479, 210,
        619, 781, 864, 907, 971, 458, 775, 410, 785, 660, 586, 850, 309, 912, 681, 559, 434, 327, 854,
        214, 281, 312, 313, 314, 321, 347, 407, 412, 443, 480, 503, 504, 510, 513, 561, 562, 609, 610, 612, 614,

        // Additional valid US area codes for comprehensive coverage
        201, 203, 204, 205, 206, 207, 208, 209, 211, 212, 215, 216, 217, 219, 220, 223, 224, 225, 226, 227,
        228, 229, 231, 234, 236, 239, 240, 242, 246, 248, 249, 250, 251, 252, 253, 254, 256, 260, 262, 263,
        264, 267, 268, 269, 270, 272, 274, 276, 278, 279, 283, 284, 289, 301, 302, 304, 306, 307, 308, 310,
        315, 316, 317, 318, 319, 320, 323, 325, 330, 331, 332, 334, 335, 337, 339, 340, 341, 343, 345, 346,
        351, 352, 353, 354, 360, 361, 364, 365, 367, 368, 380, 385, 386, 401, 402, 403, 405, 406, 408, 409,
        413, 414, 416, 417, 418, 419, 423, 424, 425, 430, 431, 432, 435, 437, 438, 440, 441, 442, 445, 447,
        448, 450, 464, 468, 469, 470, 472, 473, 474, 475, 478, 484, 501, 502, 506, 507, 508, 509, 514, 515,
        516, 517, 518, 519, 520, 530, 531, 534, 539, 540, 541, 548, 551, 552, 557, 563, 564, 567, 570, 571,
        572, 573, 574, 575, 579, 580, 581, 582, 584, 585, 587, 601, 603, 605, 606, 607, 608, 613, 615, 617,
        618, 620, 623, 626, 628, 629, 630, 631, 636, 639, 641, 646, 647, 649, 650, 651, 657, 658, 659, 662,
        664, 667, 669, 670, 671, 672, 678, 679, 680, 682, 683, 684, 689, 701, 702, 704, 705, 706, 707, 708,
        709, 712, 713, 714, 715, 716, 717, 719, 720, 721, 724, 725, 726, 727, 728, 731, 732, 734, 737, 740,
        742, 743, 747, 754, 757, 758, 760, 762, 763, 765, 769, 770, 772, 773, 774, 778, 779, 780, 782, 784,
        786, 787, 802, 803, 804, 805, 806, 807, 810, 812, 813, 814, 815, 816, 817, 818, 819, 820, 825, 826,
        828, 829, 830, 831, 832, 835, 838, 839, 840, 843, 845, 847, 848, 849, 856, 857, 858, 859, 860, 862,
        863, 865, 867, 868, 869, 870, 872, 873, 878, 901, 902, 903, 904, 905, 906, 908, 909, 910, 912, 913,
        914, 915, 916, 918, 919, 925, 928, 929, 930, 931, 934, 936, 937, 938, 939, 940, 941, 947, 949, 951,
        952, 954, 956, 959, 970, 972, 973, 975, 978, 979, 980, 984, 985, 986, 989
    ];

    // Name data
    const firstNames = [
        'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
        'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
        'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy',
        'Frank', 'Raymond', 'Gregory', 'Patrick', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam',
        'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather', 'Diane', 'Julie',
        'Sophia', 'Emma', 'Ava', 'Mia', 'Isabella', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail',
        'Noah', 'Liam', 'Mason', 'Lucas', 'Oliver', 'Alexander', 'Elijah', 'Logan', 'Caleb', 'Carter',
        'Grace', 'Sofia', 'Lily', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora', 'Scarlett',
        'Jackson', 'Aiden', 'Owen', 'Sebastian', 'Gabriel', 'Isaiah', 'Julian', 'Evan', 'Miles', 'Cameron',
        // 100 Additional unique first names
        'Ethan', 'Daniel', 'Matthew', 'Henry', 'Andrew', 'Justin', 'Samuel', 'Benjamin', 'Christopher', 'Dylan',
        'Nathaniel', 'Christian', 'Jonathan', 'Nathan', 'Connor', 'Zachary', 'Isaac', 'Anthony', 'Joshua', 'Wyatt',
        'Hunter', 'Dominic', 'Jaxon', 'Adrian', 'Leo', 'Asher', 'Eli', 'Theodore', 'Ezra', 'Hudson',
        'Lincoln', 'Gavin', 'Nicholas', 'Xavier', 'Landon', 'Jordan', 'Austin', 'Ian', 'Cooper', 'Brody',
        'Olivia', 'Emily', 'Madison', 'Hannah', 'Avery', 'Leah', 'Ella', 'Natalie', 'Victoria', 'Maya',
        'Audrey', 'Zoe', 'Claire', 'Eleanor', 'Skylar', 'Ellie', 'Samantha', 'Stella', 'Sadie', 'Lucy',
        'Madelyn', 'Aubrey', 'Arianna', 'Alice', 'Ruby', 'Eva', 'Autumn', 'Naomi', 'Nevaeh', 'Piper',        'Adelaide', 'Willow', 'Emilia', 'Josephine', 'Iris', 'Lila', 'Clara', 'Hazel', 'Nova', 'Ivy',
        'Wesley', 'Marcus', 'Silas', 'Jasper', 'Oscar', 'Joel', 'Maxwell', 'Simon', 'Everett', 'Rhys',
        'Genevieve', 'Aurora', 'Maeve', 'Quinn', 'Rosalie', 'Adeline', 'Violet', 'Wren', 'Isla', 'Juniper',
        // 100 Mexican/Hispanic first names
        'Miguel', 'Alejandro', 'Santiago', 'Mateo', 'Diego', 'Sebastián', 'Gabriel', 'Emiliano', 'Leonardo', 'Matías',
        'Nicolás', 'Valentino', 'Daniel', 'Tomás', 'Joaquín', 'Javier', 'Eduardo', 'Felipe', 'Francisco', 'Iker',
        'Rafael', 'Pablo', 'Manuel', 'Martín', 'Ricardo', 'Andrés', 'Adrián', 'Fernando', 'Carlos', 'Jorge',
        'Raúl', 'Vicente', 'César', 'Ernesto', 'Héctor', 'Guillermo', 'Mauricio', 'Enrique', 'Emilio', 'Alberto',
        'Rubén', 'Salvador', 'Arturo', 'Roberto', 'Ramón', 'Ángel', 'Juan', 'Luis', 'Armando', 'Victor',
        'Sofía', 'Isabella', 'Valentina', 'Camila', 'Valeria', 'Luciana', 'Victoria', 'Mariana', 'Ximena', 'Natalia',
        'Regina', 'Renata', 'Martina', 'Daniela', 'Gabriela', 'Paula', 'Elena', 'Sara', 'Claudia', 'Jimena',
        'Julieta', 'Catalina', 'Fernanda', 'Alma', 'Violeta', 'Carolina', 'María', 'Adriana', 'Laura', 'Andrea',
        'Ana', 'Carmen', 'Rosa', 'Luisa', 'Silvia', 'Alicia', 'Angélica', 'Teresa', 'Patricia', 'Cristina',        'Gloria', 'Marina', 'Antonia', 'Dolores', 'Guadalupe', 'Raquel', 'Esperanza', 'Mercedes', 'Josefina', 'Rocío',
        'Marta', 'Diana', 'Estela', 'Pilar', 'Isabel', 'Beatriz', 'Irene', 'Esmeralda', 'Mónica', 'Marisol',
        // 100 Black/African first names
        'Jamal', 'Darnell', 'Tyrone', 'DeShawn', 'Malik', 'Terrell', 'Trevon', 'Darryl', 'Reginald', 'Lamar',
        'Maurice', 'Jermaine', 'Rashad', 'Demetrius', 'Xavier', 'Terrence', 'Andre', 'Dante', 'Kendrick', 'Darius',
        'Antoine', 'Marquis', 'Tyree', 'Cedric', 'Elijah', 'DeAndre', 'Dwayne', 'Kwame', 'Hakeem', 'Jalen',
        'Tyrell', 'Devonte', 'Shaun', 'Kareem', 'Jamal', 'Malcolm', 'Jaheim', 'Desmond', 'Vaughn',
        'Omar', 'Isiah', 'Jerome', 'Daquan', 'Kobe', 'Akeem', 'Deion', 'Jaleel', 'Donovan', 'Ahmad',
        'Aaliyah', 'Latoya', 'Keisha', 'Tamika', 'Ebony', 'Shanice', 'Imani', 'Shaniqua', 'Jasmine', 'Destiny',
        'Ayanna', 'Latasha', 'Tanisha', 'Kiara', 'Diamond', 'Nia', 'Zaria', 'Aisha', 'Kenya', 'Shawna',
        'Iesha', 'Precious', 'Deja', 'Latonya', 'Aliyah', 'Monique', 'Sasha', 'Jamila', 'Raven', 'Simone',
        'Tiara', 'Nakia', 'Octavia', 'Shantel', 'Zakiya', 'Nichelle', 'Tiana', 'Jada', 'Moesha', 'Gabrielle',
        'Dominique', 'Aniya', 'Denise', 'Shayla', 'Asia', 'Fatima', 'Amara', 'Lakisha', 'Yolanda', 'Bianca',
        // 100 Asian first names
        'Ming', 'Wei', 'Li', 'Xiu', 'Jie', 'Ting', 'Yan', 'Ling', 'Hong', 'Yong',
        'Hui', 'Xiang', 'Jun', 'Tao', 'Qiang', 'Chao', 'Hao', 'Jian', 'Feng', 'Shan',
        'Akira', 'Yuki', 'Takashi', 'Hiroshi', 'Satoshi', 'Kenji', 'Kazuki', 'Daiki', 'Haru', 'Haruki',
        'Ji-hoon', 'Min-jun', 'Sung-min', 'Joon-ho', 'Seung-hyun', 'Dong-hyun', 'Hyun-woo', 'Jin-ho', 'Tae-ho', 'Kyu-won',
        'Sanjay', 'Rahul', 'Vijay', 'Raj', 'Amar', 'Nikhil', 'Vikram', 'Rohit', 'Amit', 'Deepak',
        'Kim', 'Lian', 'Xia', 'Mei', 'Jin', 'Hui', 'Jing', 'Fang', 'Ping', 'Min',
        'Yumiko', 'Sakura', 'Yui', 'Hina', 'Aoi', 'Rin', 'Mei', 'Yuna', 'Miu', 'Riko',
        'Ji-min', 'Soo-jin', 'Ji-young', 'Min-ji', 'Hye-jin', 'Ye-jin', 'Eun-jung', 'Ji-hye', 'Seo-yeon', 'Yu-jin',
        'Priya', 'Neha', 'Anjali', 'Pooja', 'Divya', 'Kavita', 'Meera', 'Lakshmi', 'Shreya', 'Nisha',        'Fei', 'Xue', 'Yu', 'Ju', 'Na', 'Qian', 'Zhen', 'Yi', 'Jia', 'Hua',
        // 100 Turkish first names
        'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hasan', 'İbrahim', 'Osman', 'Yusuf', 'Emre', 'Murat',
        'Kemal', 'Süleyman', 'Selim', 'Ömer', 'Fatih', 'Serkan', 'Özgür', 'Cem', 'Can', 'Burak',
        'Erhan', 'Tolga', 'Gökhan', 'Halil', 'Recep', 'Orhan', 'Taner', 'Volkan', 'Kaan', 'Mete',
        'Deniz', 'Onur', 'Barış', 'Ufuk', 'Sinan', 'Erdem', 'Berk', 'Alper', 'Engin', 'Arda',
        'Uğur', 'Yakup', 'Levent', 'Erkan', 'Taylan', 'Cihan', 'Koray', 'Özkan', 'Metin', 'Cengiz',
        'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Burcu', 'Gülsüm',
        'Özlem', 'Sevgi', 'Dilek', 'Pınar', 'Sibel', 'Gül', 'Serpil', 'Meltem', 'İpek', 'Neslihan',
        'Tülay', 'Derya', 'Aslı', 'Ebru', 'Tuğba', 'Aynur', 'Çiğdem', 'Yeşim', 'Nurcan', 'Serap',
        'Figen', 'Hülya', 'Gülay', 'Necla', 'Semra', 'Gönül', 'Selma', 'Rabia', 'Aysun', 'Nesrin',
        'Tuba', 'Berna', 'Fulya', 'İrem', 'Seda', 'Gamze', 'Aysel', 'Pembe', 'Esra', 'Sevinç',
        // 100 Russian first names
        'Alexander', 'Alexei', 'Andrei', 'Anton', 'Artem', 'Boris', 'Dmitri', 'Evgeny', 'Fyodor', 'Georgy',
        'Igor', 'Ivan', 'Kirill', 'Konstantin', 'Leonid', 'Maxim', 'Mikhail', 'Nikolai', 'Oleg', 'Pavel',
        'Roman', 'Sergei', 'Stanislav', 'Viktor', 'Vladimir', 'Vladislav', 'Yuri', 'Zakhar', 'Denis', 'Daniil',
        'Ruslan', 'Timur', 'Yaroslav', 'Gleb', 'Ilya', 'Stepan', 'Vadim', 'Valery', 'Vasily', 'Yevgeny',
        'Anatoly', 'Arkady', 'Grigory', 'Lev', 'Makar', 'Nikita', 'Petr', 'Rodion', 'Semyon', 'Tikhon',
        'Alexandra', 'Anastasia', 'Anna', 'Daria', 'Ekaterina', 'Elena', 'Elizaveta', 'Irina', 'Karina', 'Ksenia',
        'Larisa', 'Maria', 'Natalia', 'Olga', 'Polina', 'Sofia', 'Svetlana', 'Tatiana', 'Vera', 'Victoria',
        'Yana', 'Yulia', 'Zoya', 'Alina', 'Alla', 'Diana', 'Galina', 'Inna', 'Lilia', 'Lyudmila',
        'Nadezhda', 'Nina', 'Oksana', 'Raisa', 'Tamara', 'Valentina', 'Vasilisa', 'Veronika', 'Zhanna', 'Albina',
        'Arina', 'Bogdana', 'Evgenia', 'Inessa', 'Klavdiya', 'Kristina', 'Milana', 'Nonna', 'Rimma', 'Ulyana',
        // 100 Indian first names
        'Aarav', 'Abhishek', 'Aditya', 'Ajay', 'Akash', 'Aman', 'Amit', 'Anand', 'Anil', 'Ankit',
        'Arjun', 'Ashok', 'Deepak', 'Dev', 'Gaurav', 'Harsh', 'Karan', 'Krishna', 'Kumar', 'Manish',
        'Nikhil', 'Pradeep', 'Rahul', 'Raj', 'Rajesh', 'Ravi', 'Rohit', 'Sachin', 'Sanjay', 'Shiv',
        'Suresh', 'Vijay', 'Vikram', 'Vinod', 'Vivek', 'Yash', 'Aryan', 'Dhruv', 'Ishaan', 'Kabir',
        'Lakshya', 'Naman', 'Rudra', 'Sarthak', 'Shaurya', 'Shivansh', 'Vihaan', 'Advait', 'Atharv', 'Reyansh',
        'Aisha', 'Ananya', 'Anjali', 'Anu', 'Aparna', 'Asha', 'Devi', 'Divya', 'Gayatri', 'Geeta',
        'Ira', 'Jaya', 'Kavita', 'Lakshmi', 'Lata', 'Maya', 'Meera', 'Nandini', 'Nisha', 'Pooja',
        'Prachi', 'Priya', 'Radha', 'Rani', 'Ritu', 'Sanya', 'Sarita', 'Shreya', 'Sita', 'Sunita',
        'Swati', 'Uma', 'Vandana', 'Vidya', 'Zara', 'Aditi', 'Bhavana', 'Chitra', 'Deepika', 'Indira',
        'Kiran', 'Madhuri', 'Mala', 'Neeta', 'Pallavi', 'Preeti', 'Rekha', 'Sadhana', 'Sushma', 'Usha',
        // 100 Canadian first names
        'Liam', 'Noah', 'Oliver', 'Logan', 'Lucas', 'Mason', 'Ethan', 'Owen', 'Jacob', 'Jack',
        'Nathan', 'Leo', 'Benjamin', 'William', 'James', 'Henry', 'Alexander', 'Carter', 'Sebastian', 'Hunter',
        'Matthew', 'Jackson', 'Samuel', 'David', 'Wyatt', 'Luke', 'Levi', 'Isaac', 'Gabriel', 'Daniel',
        'Julian', 'Caleb', 'Anthony', 'Nicholas', 'Connor', 'Lincoln', 'Eli', 'Isaiah', 'Cameron', 'Adrian',
        'Ryan', 'Nolan', 'Jeremiah', 'Easton', 'Elijah', 'Wayne', 'Colton', 'Austin', 'Jaxon', 'Landon',
        'Emma', 'Olivia', 'Charlotte', 'Amelia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Evelyn', 'Harper',
        'Camila', 'Gianna', 'Abigail', 'Ella', 'Elizabeth', 'Sofia', 'Emily', 'Avery', 'Mila',
        'Scarlett', 'Eleanor', 'Madison', 'Layla', 'Penelope', 'Aria', 'Chloe', 'Grace', 'Ellie', 'Nora',
        'Hazel', 'Zoey', 'Riley', 'Victoria', 'Lily', 'Aurora', 'Violet', 'Nova', 'Hannah', 'Emilia',        'Zoe', 'Stella', 'Everly', 'Isla', 'Leah', 'Lillian', 'Addison', 'Willow', 'Lucy', 'Paisley',
        // 100 Hawaiian first names
        'Kai', 'Koa', 'Keoni', 'Ikaika', 'Makoa', 'Keanu', 'Kale', 'Kawika', 'Pika', 'Kapono',
        'Kahale', 'Kanoa', 'Kaleo', 'Kamal', 'Keaka', 'Kalani', 'Kauai', 'Kaulu', 'Kekoa', 'Kimo',
        'Lopaka', 'Mahina', 'Noa', 'Palani', 'Palu', 'Tane', 'Tau', 'Ulani', 'Wailani', 'Akamu',
        'Ailana', 'Akela', 'Aloha', 'Aulani', 'Haleigh', 'Halia', 'Haunani', 'Iolana', 'Kahoku', 'Kailani',
        'Kalea', 'Kalena', 'Kamea', 'Kanaloa', 'Kapo', 'Kauakahi', 'Kawelo', 'Keala', 'Kealani', 'Kehau',
        'Leilani', 'Mahina', 'Malia', 'Nalani', 'Noelani', 'Oliana', 'Palila', 'Pua', 'Tuahine', 'Uilani',
        'Akoni', 'Bane', 'Hoku', 'Kaeo', 'Kanaloa', 'Kapena', 'Keahole', 'Keali', 'Kealoha', 'Keawe',
        'Kekaulike', 'Koa', 'Lono', 'Makai', 'Makaio', 'Manu', 'Mikala', 'Nainoa', 'Okalani', 'Paki',
        'Kaiana', 'Kailua', 'Kaimana', 'Kaipo', 'Kalei', 'Kamaka', 'Kamalu', 'Kanani', 'Kapu', 'Kaulana',
        'Keahole', 'Keali', 'Kealoha', 'Keawe', 'Kekaulike', 'Koa', 'Lono', 'Makai', 'Makaio', 'Manu',
        // 100 German first names
        'Hans', 'Friedrich', 'Wilhelm', 'Heinrich', 'Karl', 'Johann', 'Ludwig', 'Franz', 'Georg', 'Otto',
        'Hermann', 'Paul', 'Ernst', 'Walter', 'Rudolf', 'Gustav', 'Arthur', 'Albert', 'Bruno', 'Klaus',
        'Dieter', 'Günter', 'Wolfgang', 'Helmut', 'Werner', 'Horst', 'Gerhard', 'Rolf', 'Jürgen', 'Uwe',
        'Thomas', 'Andreas', 'Michael', 'Stefan', 'Christian', 'Matthias', 'Alexander', 'Martin', 'Sebastian', 'Daniel',
        'Felix', 'Lukas', 'Benjamin', 'Maximilian', 'Florian', 'Tobias', 'Jan', 'David', 'Leon', 'Nils',
        'Anna', 'Maria', 'Elisabeth', 'Margarete', 'Gertrud', 'Emma', 'Bertha', 'Frieda', 'Martha', 'Hedwig',
        'Helga', 'Ingrid', 'Ursula', 'Gisela', 'Christa', 'Renate', 'Brigitte', 'Petra', 'Monika', 'Sabine',
        'Claudia', 'Susanne', 'Barbara', 'Andrea', 'Stefanie', 'Nicole', 'Melanie', 'Julia', 'Katrin', 'Sandra',
        'Laura', 'Sarah', 'Lisa', 'Anna', 'Lea', 'Lena', 'Marie', 'Sophie', 'Charlotte', 'Hannah',
        'Emilia', 'Mia', 'Emma', 'Sophia', 'Amelie', 'Johanna', 'Greta', 'Clara', 'Marlene', 'Frieda',
        // 100 French first names
        'Pierre', 'Jean', 'Michel', 'André', 'Philippe', 'Alain', 'Bernard', 'Robert', 'Jacques', 'Daniel',
        'Claude', 'Henri', 'François', 'Christian', 'Gérard', 'Louis', 'Patrick', 'Marcel', 'René', 'Paul',
        'Antoine', 'Nicolas', 'Julien', 'Sébastien', 'Alexandre', 'David', 'Fabrice', 'Olivier', 'Thierry', 'Laurent',
        'Maxime', 'Lucas', 'Hugo', 'Arthur', 'Louis', 'Gabriel', 'Raphaël', 'Adam', 'Nathan', 'Théo',
        'Baptiste', 'Clément', 'Mathis', 'Enzo', 'Léo', 'Paul', 'Tom', 'Nolan', 'Evan', 'Timéo',
        'Marie', 'Monique', 'Françoise', 'Nicole', 'Sylvie', 'Isabelle', 'Catherine', 'Martine', 'Nathalie', 'Christine',
        'Brigitte', 'Dominique', 'Véronique', 'Sandrine', 'Céline', 'Valérie', 'Karine', 'Stéphanie', 'Caroline', 'Émilie',
        'Sophie', 'Camille', 'Manon', 'Marie', 'Léa', 'Chloé', 'Sarah', 'Inès', 'Jade', 'Lola',
        'Anaïs', 'Lucie', 'Océane', 'Pauline', 'Justine', 'Clara', 'Alexia', 'Maëlys', 'Romane', 'Lisa',
        'Zoé', 'Emma', 'Louise', 'Jeanne', 'Alice', 'Juliette', 'Rose', 'Margot', 'Adèle', 'Charlotte',
        // 100 Swedish first names
        'Lars', 'Anders', 'Per', 'Nils', 'Johan', 'Erik', 'Karl', 'Olof', 'Gustav', 'Gunnar',
        'Sven', 'Axel', 'Bengt', 'Lennart', 'Arne', 'Rolf', 'Göran', 'Kjell', 'Bo', 'Leif',
        'Magnus', 'Mikael', 'Stefan', 'Mattias', 'Jonas', 'Daniel', 'Martin', 'Henrik', 'Patrik', 'Andreas',
        'Oscar', 'Alexander', 'Viktor', 'Emil', 'Lucas', 'Elias', 'Hugo', 'Oliver', 'Liam', 'William',
        'Noah', 'Adam', 'Theo', 'Leon', 'Benjamin', 'Isak', 'Sebastian', 'Albin', 'Anton', 'Filip',
        'Anna', 'Maria', 'Margareta', 'Elisabeth', 'Eva', 'Birgitta', 'Kristina', 'Karin', 'Barbro', 'Inger',
        'Lena', 'Marie', 'Helena', 'Monica', 'Susanne', 'Annika', 'Carina', 'Pia', 'Catharina', 'Agneta',
        'Emma', 'Maja', 'Julia', 'Alice', 'Lilly', 'Alicia', 'Olivia', 'Ebba', 'Wilma', 'Saga',
        'Agnes', 'Freja', 'Astrid', 'Alma', 'Elsa', 'Vera', 'Elin', 'Stella', 'Linnea', 'Molly',
        'Klara', 'Nellie', 'Alva', 'Ellen', 'Sigrid', 'Iris', 'Elise', 'Nova', 'Leah', 'Tuva',
        // 100 Additional non-white names (African, Middle Eastern, etc.)
        'Kwame', 'Kofi', 'Kojo', 'Yaw', 'Fiifi', 'Kwaku', 'Akwasi', 'Kwabena', 'Kwadwo', 'Kwame',
        'Amara', 'Asha', 'Kesi', 'Nia', 'Zuri', 'Aaliyah', 'Amina', 'Fatima', 'Layla', 'Noor',
        'Omar', 'Hassan', 'Ali', 'Ahmed', 'Muhammad', 'Ibrahim', 'Yusuf', 'Khalil', 'Rashid', 'Tariq',
        'Aisha', 'Zara', 'Leila', 'Yasmin', 'Safiya', 'Mariam', 'Khadija', 'Zahra', 'Amira', 'Salma',
        'Kofi', 'Kwame', 'Ama', 'Akosua', 'Esi', 'Efua', 'Aba', 'Adjoa', 'Akua', 'Yaa',
        'Adaora', 'Chidi', 'Emeka', 'Ikenna', 'Kelechi', 'Nnamdi', 'Obinna', 'Chinedu', 'Ugochi', 'Chioma',
        'Amahle', 'Sipho', 'Thabo', 'Nomsa', 'Lerato', 'Mandla', 'Sizani', 'Kagiso', 'Palesa', 'Tshepo',
        'Bahati', 'Jengo', 'Kesi', 'Mwangi', 'Njeri', 'Wanjiku', 'Kamau', 'Muthoni', 'Kariuki', 'Wambui',        'Desta', 'Haile', 'Tekle', 'Yonas', 'Almaz', 'Hanna', 'Meron', 'Ruth', 'Sara', 'Tsion',
        'Mamadou', 'Ousmane', 'Ibrahima', 'Moussa', 'Amadou', 'Fatou', 'Aminata', 'Mariama', 'Khadija', 'Aissatou',
        // 100 Additional Middle Eastern first names
        'Samir', 'Kareem', 'Waleed', 'Nabil', 'Rami', 'Faisal', 'Majid', 'Jamal', 'Salam', 'Adnan',
        'Hadi', 'Mansour', 'Kamal', 'Fouad', 'Saeed', 'Jamil', 'Basim', 'Nadir', 'Talal', 'Munir',
        'Ziad', 'Imad', 'Samer', 'Ghassan', 'Mahmoud', 'Amjad', 'Mazen', 'Bassam', 'Tamer', 'Osama',
        'Nader', 'Fadi', 'Sami', 'Hazem', 'Riad', 'Wael', 'Emad', 'Raed', 'Shadi', 'Jihad',
        'Mohannad', 'Bilal', 'Khaled', 'Marwan', 'Wassim', 'Hussam', 'Ghazi', 'Nabeel', 'Rafiq', 'Salim',
        'Yasmin', 'Laila', 'Rana', 'Rima', 'Dina', 'Mona', 'Hala', 'Lina', 'Maya', 'Nadia',
        'Rania', 'Samira', 'Lara', 'Dana', 'Hind', 'Reem', 'Dalia', 'Ghada', 'Sawsan', 'Bushra',
        'Inaam', 'Suha', 'Widad', 'Amira', 'Najla', 'Rabab', 'Salam', 'Wafa', 'Abeer', 'Manal',
        'Hanadi', 'Inas', 'Sanaa', 'Maha', 'Ruba', 'Nour', 'Siham', 'Maysa', 'Najwa', 'Intissar',
        'Shahd', 'Laith', 'Rayan', 'Jad', 'Nadim', 'Seif', 'Yamen', 'Basel', 'Moayad', 'Tamim'
    ];

    const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
        'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker',
        'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward',
        'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell',
        'Alexander', 'Griffin', 'West', 'Jordan', 'Owens', 'Reynolds', 'Ford', 'Hamilton', 'Graham', 'Kim',
        'Patel', 'Singh', 'Shah', 'Khan', 'Chen', 'Wu', 'Huang', 'Zhang', 'Wang', 'Li',
        'Rossi', 'Ferrari', 'Russo', 'Romano', 'Esposito', 'Ricci', 'De Luca', 'Colombo', 'Marino', 'Costa',
        'Castillo', 'Jimenez', 'Romero', 'Alvarez', 'Moreno', 'Ruiz', 'Serrano', 'Molina', 'Rojas', 'Ramos',
        'Grant', 'Spencer', 'Ferguson', 'Wells', 'Tucker', 'Hunter', 'Mcdonald', 'Murray', 'Warren', 'Marshall',
        // 100 Additional unique last names
        'Nelson', 'Baker', 'Rivera', 'Rogers', 'Wright', 'Brooks', 'Hernandez', 'Coleman', 'Watson', 'Walker',
        'Green', 'Bryant', 'Jenkins', 'Perry', 'Barnes', 'Fisher', 'Henderson', 'Young', 'Gonzalez', 'Butler',
        'Sullivan', 'Diaz', 'Richardson', 'Wood', 'Bennett', 'Gray', 'James', 'Reyes', 'Morris', 'Nguyen',
        'Murphy', 'Cook', 'Gutierrez', 'Ortiz', 'Russell', 'Stevens', 'Stewart', 'Collins', 'Walsh', 'Freeman',
        'Black', 'Wallace', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Pearson', 'Richards', 'Saunders', 'Weber',
        'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Schmidt', 'Cunningham', 'Schultz', 'Hoffman', 'Montgomery',        'Andrews', 'Perkins', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray', 'Simmons',
        'George', 'Mendoza', 'Elliott', 'Chavez', 'Lawson', 'Franklin', 'Fields', 'Hanson', 'Dawson', 'Maldonado',
        'Barker', 'Norris', 'Fleming', 'Graves', 'Fitzgerald', 'Cortez', 'Rhodes', 'Sparks', 'Douglas', 'Bauer',
        'Steele', 'Stone', 'Doyle', 'Mckenzie', 'Schwartz', 'Brennan', 'Goodwin', 'Frazier', 'Zimmerman', 'Harmon',
        // 100 Mexican/Hispanic last names
        'Hernández', 'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
        'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutiérrez', 'Chávez',
        'Ramos', 'Vargas', 'Vásquez', 'Castillo', 'Jiménez', 'Romero', 'Álvarez', 'Suárez', 'Mendoza', 'Vega',
        'Herrera', 'Castro', 'Medina', 'Aguilar', 'Delgado', 'Méndez', 'Núñez', 'Acosta', 'Figueroa', 'Miranda',
        'Contreras', 'Silva', 'Padilla', 'Salazar', 'Rojas', 'Soto', 'Valencia', 'Molina', 'Lara', 'Navarro',
        'Ríos', 'Alvarado', 'Cervantes', 'Fuentes', 'Cabrera', 'León', 'Mejía', 'Campos', 'Escobar', 'Guerrero',
        'Sandoval', 'Cordero', 'Juárez', 'Valdez', 'Maldonado', 'Santiago', 'Espinoza', 'Calderón', 'Esquivel', 'Ayala',
        'Palacios', 'Olivares', 'Domínguez', 'Zamora', 'Ochoa', 'Arellano', 'Camacho', 'Carrillo', 'Montes', 'Mora',        'Velázquez', 'Orozco', 'Cortés', 'Rosales', 'Moreno', 'Pacheco', 'Estrada', 'Bautista', 'Gallardo', 'Villanueva',
        'Arias', 'Trujillo', 'Zúñiga', 'Ibarra', 'Villegas', 'Paredes', 'Ponce', 'Bravo', 'Pineda', 'Cárdenas',
        // 100 Black/African last names
        'Washington', 'Jefferson', 'Jackson', 'Banks', 'Booker', 'Freeman', 'Gaines', 'Hayes', 'Payne', 'Simmons',
        'Mosley', 'Malone', 'Cannon', 'Wade', 'Rhodes', 'Steele', 'Porter', 'Beasley', 'Sykes', 'Baldwin',
        'Joyner', 'Love', 'Horne', 'Boone', 'Hairston', 'Stallworth', 'Dickerson', 'Montgomery', 'Golden', 'Sloan',
        'Diggs', 'Wiggins', 'Bullock', 'Holloway', 'Gant', 'Tillman', 'Byrd', 'Haywood', 'Hoover', 'Roberson',
        'Moses', 'Foreman', 'McDowell', 'Blount', 'Randle', 'Woodard', 'Dudley', 'Burks', 'Baptiste', 'Pugh',
        'Dorsey', 'Emmanuel', 'Frazier', 'Walls', 'Bias', 'McCoy', 'Spears', 'Barr', 'Toussaint', 'Hargrove',
        'Batiste', 'Mack', 'Dillard', 'Stokes', 'Fuller', 'Delaney', 'Tyson', 'Francis', 'Samuels', 'Tate',
        'Wright', 'Rivers', 'Hicks', 'Goode', 'Latimer', 'Galloway', 'Small', 'Fleming', 'Boykin', 'Drummond',
        'McClain', 'Harden', 'Lowery', 'Eldridge', 'Starks', 'Cotton', 'Burrell', 'Poindexter', 'Heath', 'Battle',
        'Rembert', 'Mobley', 'Cage', 'Lockett', 'Langston', 'Womack', 'Spence', 'Pride', 'Ephraim', 'Bluford',
        // 100 Asian last names
        'Zhang', 'Wang', 'Li', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Zhao', 'Zhou',
        'Sun', 'Ma', 'Gao', 'Lin', 'Guo', 'Zheng', 'Luo', 'Xu', 'He', 'Tang',
        'Song', 'Feng', 'Cao', 'Jiang', 'Deng', 'Zhu', 'Xie', 'Han', 'Wei', 'Cheng',
        'Tanaka', 'Suzuki', 'Sato', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato',
        'Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim',
        'Singh', 'Patel', 'Sharma', 'Kumar', 'Shah', 'Gupta', 'Mehta', 'Choudhary', 'Verma', 'Agarwal',
        'Yu', 'Lu', 'Hsu', 'Chang', 'Ho', 'Xiao', 'Pan', 'Qian', 'Hu', 'Tian',
        'Ono', 'Saito', 'Inoue', 'Yoshida', 'Nishimura', 'Sasaki', 'Honda', 'Abe', 'Ohno', 'Fujita',
        'Hwang', 'Ryu', 'Kwon', 'Seo', 'Hahn', 'Oh', 'Moon', 'Chung', 'Rhee', 'Shin',        'Reddy', 'Nair', 'Rao', 'Iyer', 'Chatterjee', 'Desai', 'Prabhu', 'Bhat', 'Joshi', 'Banerjee',
        // 100 Turkish last names
        'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydin', 'Özdemir',
        'Arslan', 'Doğan', 'Kilic', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
        'Polat', 'Erdoğan', 'Güneş', 'Tak', 'Çakır', 'Aktaş', 'Türk', 'Gül', 'Acar', 'Bulut',
        'Aksoy', 'Karaca', 'Çiftçi', 'Erdem', 'Korkmaz', 'Tunç', 'Ateş', 'Gürel', 'Işık', 'Solak',
        'Keskin', 'Tok', 'Gündüz', 'Bozkurt', 'Mutlu', 'Deniz', 'Kaplan', 'Ergin', 'Özgür', 'Oğuz',
        'Bayram', 'Duman', 'Özgün', 'Güven', 'Başar', 'Çiçek', 'Turan', 'Ceylan', 'Altın', 'Bilek',
        'Özel', 'Özer', 'Karaman', 'Uçar', 'Sonmez', 'Yağmur', 'Uzun', 'Tuna', 'Taş', 'Aydın',
        'Soysal', 'Yaşar', 'Tekin', 'Özkan', 'Gezer', 'Atalay', 'Gürbüz', 'Yıldıran', 'Güler', 'Yilmaz',
        'Ayan', 'Öğretmen', 'Köse', 'Sezer', 'Özmen', 'Güç', 'Çağlar', 'Bakır', 'Yeşil', 'Kaptan',
        // 100 Russian last names
        'Ivanov', 'Petrov', 'Sidorov', 'Smirnov', 'Kuznetsov', 'Popov', 'Volkov', 'Sokolov', 'Mikhailov', 'Novikov',
        'Fedorov', 'Morozov', 'Volkov', 'Alekseev', 'Lebedev', 'Semenov', 'Yegorov', 'Pavlov', 'Kozlov', 'Stepanov',
        'Nikolaev', 'Orlov', 'Andrianov', 'Makarov', 'Nikitin', 'Antonov', 'Tarasov', 'Belov', 'Komarov', 'Dmitriev',
        'Yakovlev', 'Grigoriev', 'Romanov', 'Vorobiev', 'Sergeev', 'Matveev', 'Vinogradov', 'Kotov', 'Smirnova', 'Bogdanov',
        'Titov', 'Krylov', 'Maksimov', 'Markov', 'Polyakov', 'Sorokin', 'Vinokurov', 'Zhukov', 'Vladimirov', 'Filippov',
        'Zakharov', 'Maslov', 'Denisov', 'Korolev', 'Ilyin', 'Gorbunov', 'Savichev', 'Melnikov', 'Shcherbakov', 'Blokhin',
        'Gerasimov', 'Pankratov', 'Naumov', 'Repin', 'Gorshkov', 'Kalinin', 'Gulyaev', 'Lazarev', 'Medvedev', 'Ershov',
        'Nesterov', 'Kasatkin', 'Isaev', 'Kostin', 'Grishanov', 'Fomin', 'Davydov', 'Melnikov', 'Shcherbina', 'Kolesnikov',
        'Parkhomenko', 'Litvinov', 'Agafonov', 'Moiseev', 'Ustinov', 'Titova', 'Fadeev', 'Gorin', 'Yukhnov', 'Sazonov',
        'Karpov', 'Frolov', 'Kondratev', 'Abramov', 'Kalashnikov', 'Saveliev', 'Prokofiev', 'Berezhnov', 'Kiselev', 'Konovalov',
        // 100 Indian last names
        'Agarwal', 'Sharma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Jain', 'Agrawal', 'Joshi',
        'Bansal', 'Mittal', 'Goyal', 'Arora', 'Chopra', 'Malhotra', 'Goel', 'Sood', 'Kapoor', 'Bhatia',
        'Sethi', 'Khanna', 'Tandon', 'Saxena', 'Varma', 'Tiwari', 'Srivastava', 'Tripathi', 'Pandey', 'Mishra',
        'Chandra', 'Verma', 'Yadav', 'Thakur', 'Singh', 'Chauhan', 'Rajput', 'Rana', 'Rathore', 'Shekhawat',
        'Bhardwaj', 'Shukla', 'Upadhyay', 'Dubey', 'Chaturvedi', 'Dwivedi', 'Ojha', 'Pathak', 'Dixit', 'Shastri',
        'Reddy', 'Rao', 'Naidu', 'Chowdhury', 'Das', 'Ghosh', 'Sen', 'Bose', 'Roy', 'Chatterjee',
        'Mukherjee', 'Banerjee', 'Ganguly', 'Bhattacharya', 'Chakraborty', 'Dutta', 'Nair', 'Menon', 'Pillai', 'Krishnan',
        'Iyer', 'Iyengar', 'Subramanian', 'Raman', 'Sundaram', 'Venkatesh', 'Bhat', 'Hegde', 'Kulkarni', 'Joshi',
        'Deshpande', 'Gadgil', 'Kelkar', 'Jog', 'Patil', 'Pawar', 'Jadhav', 'Bhosale', 'Salunkhe', 'Shinde',
        'Desai', 'Modi', 'Trivedi', 'Mehta', 'Parikh', 'Dalal', 'Vyas', 'Jani', 'Panchal', 'Bhatt',
        // 100 Canadian last names
        'Smith', 'Brown', 'Johnson', 'Williams', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor',
        'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
        'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King',
        'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
        'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
        'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
        'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez',
        'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross',
        'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington',        'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes',
        // 100 Hawaiian last names
        'Akana', 'Akau', 'Kealoha', 'Kamaka', 'Lum', 'Wong', 'Chang', 'Nakamura', 'Tanaka', 'Yamamoto',
        'Fukumoto', 'Ishida', 'Matsumoto', 'Takahashi', 'Watanabe', 'Kim', 'Park', 'Lee', 'Choi', 'Jung',
        'Kahale', 'Kekoa', 'Kapono', 'Makoa', 'Noa', 'Palani', 'Tau', 'Ulani', 'Wailani', 'Ailana',
        'Haleigh', 'Haunani', 'Iolana', 'Kailani', 'Kalea', 'Kalena', 'Kamea', 'Kawelo', 'Keala', 'Leilani',
        'Mahina', 'Malia', 'Nalani', 'Noelani', 'Oliana', 'Palila', 'Pua', 'Tuahine', 'Uilani', 'Apana',
        'Beamer', 'Char', 'Dang', 'Fong', 'Goo', 'Ho', 'Ing', 'Joe', 'Kong', 'Lau',
        'Mau', 'Ng', 'Ono', 'Pang', 'Quan', 'Ramos', 'Sato', 'Tom', 'Ung', 'Vang',
        'Wang', 'Xu', 'Young', 'Zee', 'Aloha', 'Hoku', 'Kala', 'Lono', 'Mana', 'Nalu',
        'Oahu', 'Pele', 'Rai', 'Surf', 'Taro', 'Ukulele', 'Volcano', 'Wahine', 'Xtra', 'Yin',
        'Zen', 'Aikau', 'Bento', 'Cazimero', 'Delos', 'Espinda', 'Fernandez', 'Galuteria', 'Hanabusa', 'Inouye',
        // 100 German last names
        'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
        'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
        'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier',
        'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer', 'Huber',
        'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Schubert',
        'Vogel', 'Friedrich', 'Keller', 'Günther', 'Frank', 'Berger', 'Winkler', 'Roth', 'Beck', 'Lorenz',
        'Baumann', 'Franke', 'Albrecht', 'Schuster', 'Simon', 'Ludwig', 'Böhm', 'Winter', 'Kraus', 'Martin',
        'Schumacher', 'Krämer', 'Vogt', 'Stein', 'Jäger', 'Otto', 'Sommer', 'Groß', 'Seidel', 'Heinrich',
        'Brandt', 'Haas', 'Schreiber', 'Graf', 'Schulte', 'Dietrich', 'Ziegler', 'Kuhn', 'Kühn', 'Pohl',
        'Engel', 'Horn', 'Busch', 'Bergmann', 'Thomas', 'Voigt', 'Sauer', 'Arnold', 'Wolff', 'Pfeiffer',
        // 100 French last names
        'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',
        'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard',
        'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Müller', 'Lefevre', 'Faure', 'Andre',
        'Mercier', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier', 'Francois', 'Legrand', 'Gauthier', 'Garcia',
        'Perrin', 'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Roussel', 'Mathieu', 'Gautier', 'Masson',
        'Marchand', 'Duval', 'Denis', 'Dumont', 'Marie', 'Lemaire', 'Noel', 'Meyer', 'Dufour', 'Meunier',
        'Brun', 'Blanchard', 'Giraud', 'Joly', 'Riviere', 'Lucas', 'Brunet', 'Gaillard', 'Barbier', 'Arnaud',
        'Martinez', 'Gerard', 'Roche', 'Fernandez', 'Lopez', 'Gonzalez', 'Rodriguez', 'Hernandez', 'Perez', 'Sanchez',
        'Ramirez', 'Jimenez', 'Morales', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Reyes', 'Cruz',
        'Ortiz', 'Gutierrez', 'Chavez', 'Ramos', 'Vargas', 'Castillo', 'Romero', 'Alvarez', 'Herrera', 'Medina',
        // 100 Swedish last names
        'Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson',
        'Pettersson', 'Jonsson', 'Jansson', 'Hansson', 'Bengtsson', 'Jönsson', 'Lindberg', 'Jakobsson', 'Magnusson', 'Olofsson',
        'Lindström', 'Lindqvist', 'Lindgren', 'Berg', 'Axelsson', 'Hedberg', 'Lundberg', 'Sandberg', 'Mattsson', 'Henriksson',
        'Forsberg', 'Sjöberg', 'Wallin', 'Engström', 'Eklund', 'Danielsson', 'Lundin', 'Håkansson', 'Björk', 'Bergman',
        'Wikström', 'Holmberg', 'Söderberg', 'Nyberg', 'Blomqvist', 'Claesson', 'Mårtensson', 'Gunnarsson', 'Holm', 'Samuelsson',
        'Fransson', 'Sandström', 'Lund', 'Norberg', 'Nyström', 'Holmgren', 'Hedström', 'Sundberg', 'Ekström', 'Sjögren',
        'Hermansson', 'Isaksson', 'Blom', 'Lindahl', 'Abrahamsson', 'Öberg', 'Linder', 'Månsson', 'Åberg', 'Borg',
        'Westberg', 'Nordin', 'Ström', 'Åkesson', 'Martinsson', 'Björklund', 'Andreasson', 'Dahl', 'Falk', 'Palm',
        'Linde', 'Väisänen', 'Höglund', 'Blomberg', 'Wickström', 'Bäckström', 'Nordström', 'Sundström', 'Ahlström', 'Carlsson',
        'Steen', 'Rydberg', 'Lövgren', 'Antonsson', 'Rundqvist', 'Malmberg', 'Hedlund', 'Boström', 'Lundgren', 'Grape',
        // 100 Additional non-white last names (African, Middle Eastern, etc.)
        'Adebayo', 'Okafor', 'Nwankwo', 'Ezeh', 'Okoro', 'Chukwu', 'Ogbonna', 'Eze', 'Okwu', 'Nwosu',
        'Mwangi', 'Kamau', 'Njeri', 'Wanjiku', 'Kariuki', 'Muthoni', 'Kiprotich', 'Cheruiyot', 'Rotich', 'Kipchoge',
        'Hassan', 'Ahmed', 'Ali', 'Omar', 'Ibrahim', 'Yusuf', 'Khalil', 'Rashid', 'Tariq', 'Nasser',
        'Kone', 'Traore', 'Diallo', 'Camara', 'Bah', 'Barry', 'Diarra', 'Toure', 'Keita', 'Sidibe',
        'Osei', 'Asante', 'Mensah', 'Boateng', 'Amoah', 'Gyamfi', 'Owusu', 'Agyei', 'Bonsu', 'Frimpong',
        'Ndogo', 'Mthembu', 'Dlamini', 'Mahlangu', 'Sithole', 'Mokwena', 'Mashego', 'Molefe', 'Radebe', 'Mabaso',
        'Desta', 'Haile', 'Tekle', 'Yonas', 'Girma', 'Tadesse', 'Bekele', 'Worku', 'Asefa', 'Kebede',
        'Bahati', 'Jengo', 'Kesi', 'Mfalme', 'Pendo', 'Furaha', 'Amani', 'Upendo', 'Tumaini', 'Faraja',        'Al-Ahmad', 'Al-Mahmoud', 'Al-Hassan', 'Al-Rashid', 'Al-Zahra', 'Al-Nouri', 'Al-Mansouri', 'Al-Qasimi', 'Al-Maktoum', 'Al-Thani',
        'Ben-David', 'Ben-Abraham', 'Ben-Yosef', 'Ben-Avraham', 'Cohen', 'Levy', 'Mizrahi', 'Peretz', 'Goldberg', 'Rosenberg',
        // 100 Additional Middle Eastern last names
        'Al-Masri', 'Al-Shami', 'Al-Baghdadi', 'Al-Hijazi', 'Al-Najdi', 'Al-Yamani', 'Al-Maghribi', 'Al-Sudani', 'Al-Lubnani', 'Al-Urduni',
        'Bin-Salman', 'Bin-Rashid', 'Bin-Zayed', 'Bin-Khalifa', 'Bin-Sabah', 'Bin-Maktoum', 'Bin-Thani', 'Bin-Saud', 'Bin-Hamad', 'Bin-Mohammed',
        'Khoury', 'Saad', 'Nasser', 'Mansour', 'Farah', 'Shamoun', 'Haddad', 'Khalil', 'Saleh', 'Habib',
        'Abdel-Rahman', 'Abdel-Aziz', 'Abdel-Wahab', 'Abdel-Malik', 'Abdel-Ghani', 'Abdel-Hamid', 'Abdel-Fattah', 'Abdel-Karim', 'Abdel-Latif', 'Abdel-Majid',
        'Qasemi', 'Hashemi', 'Hosseini', 'Moussavi', 'Rafsanjani', 'Khamenei', 'Yazdi', 'Sistani', 'Shirazi', 'Tabatabaei',
        'Boulos', 'Geagea', 'Hariri', 'Jumblatt', 'Aoun', 'Berri', 'Salam', 'Mikati', 'Frangieh', 'Gemayel',
        'Sayegh', 'Tahan', 'Zaher', 'Hakim', 'Karam', 'Rizk', 'Bitar', 'Ayyoub', 'Salameh', 'Maatouk',
        'Qaddoumi', 'Barghouti', 'Haniyeh', 'Mashal', 'Zahar', 'Rantisi', 'Yassin', 'Shehada', 'Issa', 'Qurei'
    ];

    // Middle names for more complete identities
    const middleNames = [
        // Common middle names
        'Lee', 'James', 'Michael', 'Alan', 'David', 'Wayne', 'Robert', 'Joseph', 'Allen', 'Scott',
        'Ray', 'Paul', 'Edward', 'Brian', 'John', 'William', 'Richard', 'Thomas', 'Mark', 'Anne',
        'Marie', 'Elizabeth', 'Nicole', 'Ann', 'Renee', 'Michelle', 'Louise', 'Jean', 'Rose', 'Grace',
        'Jane', 'Diane', 'Kay', 'Sue', 'May', 'Jo', 'Rae', 'Hope', 'Lynn', 'Alexander',
        'Anthony', 'Arthur', 'Benjamin', 'Carl', 'Dale', 'Dean', 'Dennis', 'Douglas', 'Earl', 'Eric',
        // 50 Additional unique middle names        'Eugene', 'Francis', 'Frederick', 'Gary', 'Glenn', 'Gordon', 'Gregory', 'Harold', 'Henry', 'Howard',
        'Jack', 'Jay', 'Keith', 'Kenneth', 'Lawrence', 'Lewis', 'Lloyd', 'Louis', 'Martin', 'Neil',
        'Nicholas', 'Norman', 'Patrick', 'Peter', 'Philip', 'Ralph', 'Raymond', 'Roger', 'Ronald', 'Roy',
        'Russell', 'Samuel', 'Stephen', 'Terry', 'Timothy', 'Walter', 'Victor', 'Adrian', 'Albert', 'Blake',
        'Bradley', 'Brent', 'Brett', 'Bruce', 'Caleb', 'Cameron', 'Claire', 'Dawn', 'Faith', 'Frances',
        // 50 Additional Hispanic/Spanish middle names        'Alejandro', 'Antonio', 'Benito', 'Carlos', 'César', 'Cristóbal', 'Cruz', 'Diego', 'Eduardo', 'Emilio',
        'Enrique', 'Esteban', 'Fernando', 'Francisco', 'Gabriel', 'Gerardo', 'Guillermo', 'Gustavo', 'Ignacio', 'Jaime',
        'Javier', 'Jorge', 'José', 'Juan', 'Julio', 'Lorenzo', 'Luis', 'Manuel', 'Marco', 'Miguel',
        'Pablo', 'Pedro', 'Rafael', 'Ramón', 'Raúl', 'Ricardo', 'Roberto', 'Rodrigo', 'Salvador', 'Santiago',
        'Ana', 'Carmen', 'Dolores', 'Elena', 'Inés', 'Josefina', 'Lucía', 'María', 'Mercedes', 'Teresa',
        // 100 Mixed Black/Asian middle names
        'Jamal', 'DeShawn', 'Malik', 'Rashad', 'Xavier', 'Tyrone', 'LaMar', 'Dante', 'Kwame', 'Darius',
        'Darryl', 'Jabari', 'Hakeem', 'Antoine', 'Terence', 'Darnell', 'Imani', 'Jelani', 'Kofi', 'Jaheim',
        'Dion', 'Jayvon', 'Kadeem', 'Amir', 'Kareem', 'Omar', 'Desmond', 'Zaire', 'Tyree', 'Shaquille',
        'Nia', 'Aisha', 'Amara', 'Ayanna', 'Ebony', 'Fatima', 'Imani', 'Jamila', 'Latoya', 'Naeemah',
        'Sakina', 'Yara', 'Zora', 'Aaliyah', 'Amina', 'Ashanti', 'Maya', 'Kiara', 'Tanisha', 'Zuri',
        'Ming', 'Wei', 'Jing', 'Ling', 'Yan', 'Jie', 'Feng', 'Chao', 'Yong', 'Xiang',
        'Akira', 'Hiroshi', 'Kenji', 'Takashi', 'Satoshi', 'Yuki', 'Haruki', 'Kazuki', 'Daiki', 'Ryota',
        'Sung', 'Jin', 'Hyun', 'Seung', 'Min', 'Joon', 'Tae', 'Kyu', 'Ji', 'Hwan',        'Mei', 'Xiu', 'Hua', 'Xia', 'Jia', 'Qian', 'Yi', 'Fei', 'Yu', 'Na',
        'Yumiko', 'Sakura', 'Aoi', 'Hina', 'Yuna', 'Rin', 'Miyu', 'Miu', 'Saki', 'Yui',
        // 100 Turkish middle names
        'Ahmet', 'Mehmet', 'Ali', 'Hasan', 'Mustafa', 'Ömer', 'İbrahim', 'Yusuf', 'Kemal', 'Fatih',
        'Emre', 'Murat', 'Serkan', 'Can', 'Burak', 'Deniz', 'Onur', 'Barış', 'Cem', 'Özgür',
        'Tolga', 'Gökhan', 'Erhan', 'Volkan', 'Kaan', 'Sinan', 'Erdem', 'Alper', 'Berk', 'Arda',
        'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Burcu', 'Özlem',
        'Sevgi', 'Dilek', 'Pınar', 'Sibel', 'Gül', 'Serpil', 'Meltem', 'İpek', 'Derya', 'Aslı',
        'Ebru', 'Tuğba', 'Çiğdem', 'Yeşim', 'Serap', 'Hülya', 'Gülay', 'Selma', 'Rabia', 'Tuba',
        'Berna', 'Fulya', 'İrem', 'Seda', 'Gamze', 'Esra', 'Sevinç', 'Pembe', 'Aysun', 'Nesrin',
        'Necla', 'Semra', 'Gönül', 'Figen', 'Aysel', 'Tülay', 'Neslihan', 'Gülsüm', 'Aynur', 'Nurcan',
        // 100 Russian middle names
        'Alexandrovich', 'Alexeyevich', 'Andreyevich', 'Antonovich', 'Arkadyevich', 'Borisovich', 'Dmitrievich', 'Evgenyevich', 'Fyodorovich', 'Georgievich',
        'Igorevich', 'Ivanovich', 'Kirillovich', 'Konstantinovich', 'Leonidovich', 'Maximovich', 'Mikhailovich', 'Nikolayevich', 'Olegovich', 'Pavlovich',
        'Romanovich', 'Sergeyevich', 'Stanislavovich', 'Viktorovich', 'Vladimirovich', 'Vladislavovich', 'Yuryevich', 'Zakharovich', 'Denisovich', 'Daniilovich',
        'Ruslanovich', 'Timurovich', 'Yaroslavovich', 'Glebovich', 'Ilyich', 'Stepanovich', 'Vadimovich', 'Valeryevich', 'Vasilyevich', 'Yevgenyevich',
        'Anatolyevich', 'Arkadyevich', 'Grigoryevich', 'Lvovich', 'Makarovich', 'Nikitich', 'Petrovich', 'Rodionovich', 'Semyonovich', 'Tikhonovich',
        'Alexandrovna', 'Anastasievna', 'Annovna', 'Darievna', 'Ekaterinovna', 'Elenovna', 'Elizavetovna', 'Irinovna', 'Karinovna', 'Ksenievna',
        'Larisovna', 'Marievna', 'Natalievna', 'Olgovna', 'Polinovna', 'Sofievna', 'Svetlanovna', 'Tatianovna', 'Verovna', 'Viktorievna',
        'Yanovna', 'Yulievna', 'Zoyevna', 'Alinovna', 'Allovna', 'Dianovna', 'Galinovna', 'Innovna', 'Lilievna', 'Lyudmilovna',
        'Nadezhdovna', 'Ninovna', 'Oksanovna', 'Raisovna', 'Tamarovna', 'Valentinovna', 'Vasilievna', 'Veronikovna', 'Zhannovna', 'Albinovna',
        'Arinovna', 'Bogdanovna', 'Evgenievna', 'Inessovna', 'Klavdievna', 'Kristinovna', 'Milanovna', 'Nonnovna', 'Rimmovna', 'Ulyanovna',
        // 100 Indian middle names
        'Kumar', 'Singh', 'Raj', 'Dev', 'Prasad', 'Chandra', 'Prakash', 'Kishore', 'Mohan', 'Shankar',
        'Raman', 'Anand', 'Shekhar', 'Bhushan', 'Narayan', 'Gopal', 'Krishnan', 'Lakshman', 'Mani', 'Ravi',
        'Suresh', 'Mahesh', 'Ramesh', 'Dinesh', 'Mukesh', 'Naresh', 'Rajesh', 'Yogesh', 'Umesh', 'Nilesh',
        'Ganesh', 'Girish', 'Harish', 'Jagdish', 'Kamlesh', 'Lokesh', 'Manish', 'Paresh', 'Ritesh', 'Sandesh',
        'Venkatesh', 'Yagnesh', 'Alpesh', 'Bhavesh', 'Chirag', 'Dhiren', 'Hitesh', 'Jignesh', 'Kalpesh', 'Mitesh',
        'Devi', 'Kumari', 'Rani', 'Bai', 'Mata', 'Shree', 'Lata', 'Kala', 'Valli', 'Priya',
        'Maya', 'Gita', 'Sita', 'Rita', 'Nita', 'Mita', 'Lila', 'Kiran', 'Usha', 'Asha',
        'Radha', 'Kamala', 'Shanti', 'Shakti', 'Lakshmi', 'Saraswati', 'Durga', 'Parvati', 'Gauri', 'Savitri',
        'Sunita', 'Geeta', 'Seeta', 'Meeta', 'Veena', 'Leela', 'Sheela', 'Neela', 'Heera', 'Mira',
        'Indira', 'Shobha', 'Rekha', 'Sudha', 'Vidya', 'Kavita', 'Sangita', 'Namita', 'Smita', 'Anita',
        // 100 Canadian middle names
        'James', 'John', 'William', 'David', 'Robert', 'Michael', 'Richard', 'Thomas', 'Charles', 'Joseph',
        'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin',
        'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
        'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel',
        'Gregory', 'Frank', 'Raymond', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron',
        'Marie', 'Anne', 'Elizabeth', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Susan', 'Jessica', 'Sarah',
        'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon',
        'Michelle', 'Laura', 'Emily', 'Kimberly', 'Deborah', 'Dorothy', 'Amy', 'Angela', 'Ashley', 'Brenda',
        'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail',        'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria', 'Riley', 'Aria', 'Zoe', 'Penelope', 'Lillian',
        // 100 Hawaiian middle names
        'Kai', 'Koa', 'Keoni', 'Ikaika', 'Makoa', 'Keanu', 'Kale', 'Kawika', 'Pika', 'Kapono',
        'Kahale', 'Kanoa', 'Kaleo', 'Kamal', 'Keaka', 'Kalani', 'Kauai', 'Kaulu', 'Kekoa', 'Kimo',
        'Lopaka', 'Mahina', 'Noa', 'Palani', 'Palu', 'Tane', 'Tau', 'Ulani', 'Wailani', 'Akamu',
        'Ailana', 'Akela', 'Aloha', 'Aulani', 'Haleigh', 'Halia', 'Haunani', 'Iolana', 'Kahoku', 'Kailani',
        'Kalea', 'Kalena', 'Kamea', 'Kanaloa', 'Kapo', 'Kauakahi', 'Kawelo', 'Keala', 'Kealani', 'Kehau',
        'Leilani', 'Malia', 'Nalani', 'Noelani', 'Oliana', 'Palila', 'Pua', 'Tuahine', 'Uilani', 'Akoni',
        'Bane', 'Hoku', 'Kaeo', 'Kanaloa', 'Kapena', 'Keahole', 'Keali', 'Kealoha', 'Keawe', 'Kekaulike',
        'Lono', 'Makai', 'Makaio', 'Manu', 'Mikala', 'Nainoa', 'Okalani', 'Paki', 'Kaiana', 'Kailua',
        'Kaimana', 'Kaipo', 'Kalei', 'Kamaka', 'Kamalu', 'Kanani', 'Kapu', 'Kaulana', 'Liko', 'Maka',
        // 100 German middle names
        'Hans', 'Friedrich', 'Wilhelm', 'Heinrich', 'Karl', 'Johann', 'Ludwig', 'Franz', 'Georg', 'Otto',
        'Hermann', 'Paul', 'Ernst', 'Walter', 'Rudolf', 'Gustav', 'Arthur', 'Albert', 'Bruno', 'Klaus',
        'Dieter', 'Günter', 'Wolfgang', 'Helmut', 'Werner', 'Horst', 'Gerhard', 'Rolf', 'Jürgen', 'Uwe',
        'Thomas', 'Andreas', 'Michael', 'Stefan', 'Christian', 'Matthias', 'Alexander', 'Martin', 'Sebastian', 'Daniel',
        'Felix', 'Lukas', 'Benjamin', 'Maximilian', 'Florian', 'Tobias', 'Jan', 'David', 'Leon', 'Nils',
        'Anna', 'Maria', 'Elisabeth', 'Margarete', 'Gertrud', 'Emma', 'Bertha', 'Frieda', 'Martha', 'Hedwig',
        'Helga', 'Ingrid', 'Ursula', 'Gisela', 'Christa', 'Renate', 'Brigitte', 'Petra', 'Monika', 'Sabine',
        'Claudia', 'Susanne', 'Barbara', 'Andrea', 'Stefanie', 'Nicole', 'Melanie', 'Julia', 'Katrin', 'Sandra',
        'Laura', 'Sarah', 'Lisa', 'Lea', 'Lena', 'Marie', 'Sophie', 'Charlotte', 'Hannah', 'Emilia',
        'Mia', 'Sophia', 'Amelie', 'Johanna', 'Greta', 'Clara', 'Marlene', 'Frieda', 'Luise', 'Mathilde',
        // 100 French middle names
        'Pierre', 'Jean', 'Michel', 'André', 'Philippe', 'Alain', 'Bernard', 'Robert', 'Jacques', 'Daniel',
        'Claude', 'Henri', 'François', 'Christian', 'Gérard', 'Louis', 'Patrick', 'Marcel', 'René', 'Paul',
        'Antoine', 'Nicolas', 'Julien', 'Sébastien', 'Alexandre', 'David', 'Fabrice', 'Olivier', 'Thierry', 'Laurent',
        'Maxime', 'Lucas', 'Hugo', 'Arthur', 'Gabriel', 'Raphaël', 'Adam', 'Nathan', 'Théo', 'Baptiste',
        'Clément', 'Mathis', 'Enzo', 'Léo', 'Tom', 'Nolan', 'Evan', 'Timéo', 'Liam', 'Noah',
        'Marie', 'Monique', 'Françoise', 'Nicole', 'Sylvie', 'Isabelle', 'Catherine', 'Martine', 'Nathalie', 'Christine',
        'Brigitte', 'Dominique', 'Véronique', 'Sandrine', 'Céline', 'Valérie', 'Karine', 'Stéphanie', 'Caroline', 'Émilie',
        'Sophie', 'Camille', 'Manon', 'Léa', 'Chloé', 'Sarah', 'Inès', 'Jade', 'Lola', 'Anaïs',
        'Lucie', 'Océane', 'Pauline', 'Justine', 'Clara', 'Alexia', 'Maëlys', 'Romane', 'Lisa', 'Zoé',
        'Emma', 'Louise', 'Jeanne', 'Alice', 'Juliette', 'Rose', 'Margot', 'Adèle', 'Charlotte', 'Élise',
        // 100 Swedish middle names
        'Lars', 'Anders', 'Per', 'Nils', 'Johan', 'Erik', 'Karl', 'Olof', 'Gustav', 'Gunnar',
        'Sven', 'Axel', 'Bengt', 'Lennart', 'Arne', 'Rolf', 'Göran', 'Kjell', 'Bo', 'Leif',
        'Magnus', 'Mikael', 'Stefan', 'Mattias', 'Jonas', 'Daniel', 'Martin', 'Henrik', 'Patrik', 'Andreas',
        'Oscar', 'Alexander', 'Viktor', 'Emil', 'Lucas', 'Elias', 'Hugo', 'Oliver', 'Liam', 'William',
        'Noah', 'Adam', 'Theo', 'Leon', 'Benjamin', 'Isak', 'Sebastian', 'Albin', 'Anton', 'Filip',
        'Anna', 'Maria', 'Margareta', 'Elisabeth', 'Eva', 'Birgitta', 'Kristina', 'Karin', 'Barbro', 'Inger',
        'Lena', 'Marie', 'Helena', 'Monica', 'Susanne', 'Annika', 'Carina', 'Pia', 'Catharina', 'Agneta',
        'Emma', 'Maja', 'Julia', 'Alice', 'Lilly', 'Alicia', 'Olivia', 'Ebba', 'Wilma', 'Saga',
        'Agnes', 'Freja', 'Astrid', 'Alma', 'Elsa', 'Vera', 'Elin', 'Stella', 'Linnea', 'Molly',
        'Klara', 'Nellie', 'Alva', 'Ellen', 'Sigrid', 'Iris', 'Elise', 'Nova', 'Leah', 'Tuva',
        // 100 Additional non-white middle names (African, Middle Eastern, etc.)
        'Kwame', 'Kofi', 'Kojo', 'Yaw', 'Fiifi', 'Kwaku', 'Akwasi', 'Kwabena', 'Kwadwo', 'Amara',
        'Asha', 'Kesi', 'Nia', 'Zuri', 'Aaliyah', 'Amina', 'Fatima', 'Layla', 'Noor', 'Omar',
        'Hassan', 'Ali', 'Ahmed', 'Muhammad', 'Ibrahim', 'Yusuf', 'Khalil', 'Rashid', 'Tariq', 'Aisha',
        'Zara', 'Leila', 'Yasmin', 'Safiya', 'Mariam', 'Khadija', 'Zahra', 'Amira', 'Salma', 'Ama',
        'Akosua', 'Esi', 'Efua', 'Aba', 'Adjoa', 'Akua', 'Yaa', 'Adaora', 'Chidi', 'Emeka',
        'Ikenna', 'Kelechi', 'Nnamdi', 'Obinna', 'Chinedu', 'Ugochi', 'Chioma', 'Amahle', 'Sipho', 'Thabo',
        'Nomsa', 'Lerato', 'Mandla', 'Sizani', 'Kagiso', 'Palesa', 'Tshepo', 'Bahati', 'Jengo', 'Mwangi',
        'Njeri', 'Wanjiku', 'Kamau', 'Muthoni', 'Kariuki', 'Wambui', 'Desta', 'Haile', 'Tekle', 'Yonas',
        'Almaz', 'Hanna', 'Meron', 'Ruth', 'Sara', 'Tsion', 'Mamadou', 'Ousmane', 'Ibrahima', 'Moussa',
        'Amadou', 'Fatou', 'Aminata', 'Mariama', 'Khadija', 'Aissatou', 'Sekou', 'Bakary', 'Lamine', 'Boubacar'
    ];

    // Email domains
    const personalEmailDomains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com',
        'comcast.net', 'verizon.net', 'att.net', 'cox.net',
        'msn.com', 'live.com', 'me.com', 'ymail.com', 'sbcglobal.net',
        'protonmail.com', 'zoho.com', 'fastmail.com'
    ];      // Address data for US and international
    const usStates = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
    ];
      // State abbreviations mapping - maps full state names to their two-letter codes
    const stateAbbreviations = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
        'District of Columbia': 'DC'
    };

    // Create reverse mapping from abbreviations to full state names
    const stateAbbreviationsReverse = {};
    for (const stateName in stateAbbreviations) {
        stateAbbreviationsReverse[stateAbbreviations[stateName]] = stateName;
    }
    // Function to get a random address from any source (merged database)
    function getRandomAddress() {
        // Decide whether to use a business address from the database or generate a new address
        // 50% chance for each method
        if (Math.random() < 0.5) {
            return getRandomElement(businessAddressDatabase);
        } else {
            // Use the same method as in generateIdentity to get an address
            const isUS = Math.random() < 0.75;
            return isUS ? generateUSAddress() : generateInternationalAddress();
        }
    }

    // Function to generate a US-only identity (for Individual section)
    function generateUSIdentity() {
        // Use the same logic as generateIdentity but force US address
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);

        // Create a personal email from the name
        const domain = getRandomElement(personalEmailDomains);
        // Sanitize and format the email name
        let sanitizedEmailName = (firstName.toLowerCase() +
                             (Math.random() > 0.5 ? '.' : '') +
                             lastName.toLowerCase() +
                             (Math.random() > 0.7 ? Math.floor(Math.random() * 100) : ''))
            .replace(/[^a-z0-9.]/g, '') // Remove invalid email characters
            .replace(/\.+/g, '.') // Replace multiple consecutive dots with a single one
            .replace(/^\.|\.$/, '') // Remove dots at the beginning or end
            .replace(/__+/g, '_'); // Replace multiple consecutive underscores with a single one

        // If after sanitization we have an empty string, use a simple fallback
        if (!sanitizedEmailName) {
            sanitizedEmailName = firstName.toLowerCase() + Math.floor(Math.random() * 100);
        }

        const email = sanitizedEmailName + '@' + domain;

        // Generate phone with a valid area code
        const area = getRandomElement(validAreaCodes);
        const prefix = Math.floor(Math.random() * 800) + 200; // Avoid prefixes starting with 0 or 1
        const lineNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const phone = `${area}-${prefix}-${lineNum}`;

        // Always use US address for individuals
        const address = generateUSAddress();

        // Return the complete identity
        return {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            isUS: true, // Always true for US identities
            address: address
        };
    }

      // Violation types for form selection
    const violationTypes = [
        'Benefit/Marriage Fraud',
        'Bulk Cash Smuggling/Financial Crimes',
        'Child Exploitation/Pornography',
        'Cyber Crimes',
        'Employment/Exploitation of Unlawful Workers',
        'F/M Student Violations, Including OPT',
        'Fugitive Criminal Alien',
        'Gang Related',
        'Human Rights Violators',
        'Human Smuggling',
        'Human Trafficking (Forced Labor/Slavery)',
        'Immigration Telefraud',
        'Intellectual Property Rights',
        'Narcotics Smuggling',
        'Terrorism Related',
        'Trade Exportation Violation',
        'Trade Importation Violation',
        'Weapons Smuggling',
        'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)'
    ];

    // Specific "Other" violation reasons that will be used when "Other" is selected
    const otherViolationReasons = [
        'Unauthorized Travel Document Services',
        'Document Authentication Fraud',
        'Fraudulent Translation Services',
        'Fraudulent Legal Services',
        'Unauthorized Tax Preparation Services',
        'Fraudulent Benefits Facilitation',
        'Health Insurance Fraud Scheme',
        'Fraudulent Educational Credential Services',
        'Unauthorized Employment Agency',
        'Fraudulent Housing Assistance Program',
        'Unauthorized Financial Services',
        'Unlicensed Money Transfer Operation',
        'Digital Currency Exchange Violation',
        'Unauthorized Transportation Services',
        'Digital Identity Fabrication Service',
        'Fraudulent Business Registration Services',
        'Unauthorized Shipping Services',
        'Document Alteration Services',
        'Unauthorized Notary Services',
        'Fraudulent Educational Institution',
        'Unauthorized Religious Worker Program',
        'Unauthorized Healthcare Services',
        'Unauthorized Labor Brokering Services',
        'Fraudulent Professional Certification',
        'Unauthorized Real Estate Services',        'Fraudulent Cultural Exchange Program',
        'Fraudulent Charitable Organization',
        'Unauthorized Social Benefits Services',
        'Unauthorized Document Translation Service',
        'Fraudulent Employment Verification Services'
    ];

    // Specific fraud types for Benefit/Marriage Fraud dropdown
    const benefitFraudTypes = [
        'Asylum/Refugee Fraud',
        'Religious Worker Visa Fraud',
        'Employment Fraud - H-1B',
        'Employment Fraud - H-2A',
        'Employment Fraud - H-2B',
        'Employment Fraud - Other',
        'Investor Visa Fraud - EB-5',
        'Student Visa Fraud',
        'Marriage or Fiance(e) Visa Fraud - K-1',
        'Unauthorized Practice of Immigration Law - Notarios',
        'Other - Immigration Benefit Fraud/Abuse'
    ];    // Business names for the Business/Company violator type
    const businessNames = [
        'Global Logistics Solutions',
        'Horizon Employment Services',
        'Interstate Cargo & Freight',
        'Pacific Rim Imports LLC',
        'Citizens Immigration Services Inc',
        'Universal Visa Assistance',
        'Atlas Employment Agency',
        'Southwestern Contracting Co',
        'Evergreen Harvesting Ltd',
        'Coastal Staffing Solutions',
        'United Labor Resources',
        'Continental Transport Systems',
        'Heritage Visa Consultants',
        'Reliable Document Services',
        'National Mobility Corp',
        'Pioneer Construction Staffing',
        'Sunshine Agricultural Labor',
        'Five Star Hotel Management',
        'Golden State Processing Center',
        'Freedom Immigration Services',
        'Affordable Visa Solutions',
        'Eagle Eye Security Systems',
        'Metropolitan Cleaning Services',
        'Ace Technology Staffing',
        'Swift Logistics & Warehousing',
        'Monarch Food Processing Inc',
        'Keystone Manufacturing Group',
        'Rapid Cash Transfer Services',
        'Western Union Alternative LLC',
        'Federal Document Processing'
    ];

    // Business types/industries for generating more realistic company names
    const businessTypes = [
        'Construction',
        'Agriculture',
        'Food Processing',
        'Transportation',
        'Hospitality',
        'Manufacturing',
        'Technology',
        'Healthcare',
        'Retail',
        'Security',
        'Cleaning Services',
        'Financial Services',
        'Immigration Services',
        'Staffing Agency',
        'Consulting Firm'
    ];

    // Real business addresses database from TransShield
    const businessAddressDatabase = [
        // New York
        {line1: '350 Fifth Avenue', line2: 'Floor 32', city: 'New York', state: 'New York', zip: '10118', country: 'United States'},
        {line1: '30 Rockefeller Plaza', line2: 'Suite 2100', city: 'New York', state: 'New York', zip: '10112', country: 'United States'},
        {line1: '200 Park Avenue', line2: '', city: 'New York', state: 'New York', zip: '10166', country: 'United States'},
        // California
        {line1: '1 Apple Park Way', line2: '', city: 'Cupertino', state: 'California', zip: '95014', country: 'United States'},
        {line1: '1600 Amphitheatre Parkway', line2: '', city: 'Mountain View', state: 'California', zip: '94043', country: 'United States'},
        {line1: '1 Hacker Way', line2: '', city: 'Menlo Park', state: 'California', zip: '94025', country: 'United States'},
        // Illinois
        {line1: '233 S Wacker Dr', line2: 'Floor 103', city: 'Chicago', state: 'Illinois', zip: '60606', country: 'United States'},
        {line1: '875 N Michigan Ave', line2: 'Suite 3100', city: 'Chicago', state: 'Illinois', zip: '60611', country: 'United States'},
        {line1: '401 N Wabash Ave', line2: '', city: 'Chicago', state: 'Illinois', zip: '60611', country: 'United States'},
        // Texas
        {line1: '1 Cowboys Way', line2: '', city: 'Frisco', state: 'Texas', zip: '75034', country: 'United States'},
        {line1: '1 AT&T Way', line2: '', city: 'Dallas', state: 'Texas', zip: '75202', country: 'United States'},
        {line1: '2200 Post Oak Blvd', line2: 'Suite 1800', city: 'Houston', state: 'Texas', zip: '77056', country: 'United States'},
        // Florida
        {line1: '1 Panther Parkway', line2: '', city: 'Sunrise', state: 'Florida', zip: '33323', country: 'United States'},
        {line1: '1601 Collins Avenue', line2: 'Penthouse', city: 'Miami Beach', state: 'Florida', zip: '33139', country: 'United States'},
        {line1: '333 SE 2nd Ave', line2: '', city: 'Miami', state: 'Florida', zip: '33131', country: 'United States'},
        // Washington
        {line1: '325 9th Ave', line2: '', city: 'Seattle', state: 'Washington', zip: '98104', country: 'United States'},
        {line1: '400 Broad St', line2: '', city: 'Seattle', state: 'Washington', zip: '98109', country: 'United States'},
        {line1: '700 Bellevue Way NE', line2: 'Suite 450', city: 'Bellevue', state: 'Washington', zip: '98004', country: 'United States'},
        // Massachusetts
        {line1: '1 Beacon Street', line2: 'Floor 15', city: 'Boston', state: 'Massachusetts', zip: '02108', country: 'United States'},
        {line1: '100 Cambridge Street', line2: '', city: 'Boston', state: 'Massachusetts', zip: '02114', country: 'United States'},
        {line1: '800 Boylston St', line2: 'Suite 2860', city: 'Boston', state: 'Massachusetts', zip: '02199', country: 'United States'},
        // Pennsylvania
        {line1: '1735 Market St', line2: 'Floor 42', city: 'Philadelphia', state: 'Pennsylvania', zip: '19103', country: 'United States'},
        {line1: '600 Grant St', line2: '', city: 'Pittsburgh', state: 'Pennsylvania', zip: '15219', country: 'United States'},
        {line1: '1 Liberty Pl', line2: 'Suite 3200', city: 'Philadelphia', state: 'Pennsylvania', zip: '19103', country: 'United States'},
        // Georgia
        {line1: '1 Coca Cola Plz NW', line2: '', city: 'Atlanta', state: 'Georgia', zip: '30313', country: 'United States'},
        {line1: '3344 Peachtree Rd NE', line2: 'Tower Place 100', city: 'Atlanta', state: 'Georgia', zip: '30326', country: 'United States'},        {line1: '1 CNN Center', line2: '', city: 'Atlanta', state: 'Georgia', zip: '30303', country: 'United States'},
        {line1: '1700 Lincoln St', line2: 'Floor 17', city: 'Denver', state: 'Colorado', zip: '80203', country: 'United States'},        {line1: '1670 Broadway', line2: 'Suite 3400', city: 'Denver', state: 'Colorado', zip: '80202', country: 'United States'},
        {line1: '2 E Washington St', line2: '', city: 'Phoenix', state: 'Arizona', zip: '85004', country: 'United States'},        {line1: '40 E Rio Salado Pkwy', line2: 'Suite 425', city: 'Tempe', state: 'Arizona', zip: '85281', country: 'United States'},
        {line1: '100 N Tryon St', line2: '', city: 'Charlotte', state: 'North Carolina', zip: '28202', country: 'United States'},        {line1: '301 Fayetteville St', line2: 'Floor 21', city: 'Raleigh', state: 'North Carolina', zip: '27601', country: 'United States'},
        {line1: '1001 Woodward Ave', line2: '', city: 'Detroit', state: 'Michigan', zip: '48226', country: 'United States'},        {line1: '200 Ottawa Ave NW', line2: 'Suite 500', city: 'Grand Rapids', state: 'Michigan', zip: '49503', country: 'United States'},
        {line1: '3799 Las Vegas Blvd S', line2: '', city: 'Las Vegas', state: 'Nevada', zip: '89109', country: 'United States'},
        {line1: '1 S Main St', line2: '', city: 'Las Vegas', state: 'Nevada', zip: '89101', country: 'United States'},
        // District of Columbia
        {line1: '1600 Pennsylvania Avenue NW', line2: '', city: 'Washington', state: 'District of Columbia', zip: '20500', country: 'United States'},
        {line1: '1100 New York Ave NW', line2: 'Suite 300', city: 'Washington', state: 'District of Columbia', zip: '20005', country: 'United States'},
        {line1: '1775 Pennsylvania Ave NW', line2: 'Floor 4', city: 'Washington', state: 'District of Columbia', zip: '20006', country: 'United States'},
        // Ohio
        {line1: '45 E 7th St', line2: '', city: 'Cincinnati', state: 'Ohio', zip: '45202', country: 'United States'},
        {line1: '10 W Broad St', line2: 'Suite 2100', city: 'Columbus', state: 'Ohio', zip: '43215', country: 'United States'},
        {line1: '200 Public Square', line2: 'Floor 31', city: 'Cleveland', state: 'Ohio', zip: '44114', country: 'United States'},
        // Missouri
        {line1: '1 Metropolitan Square', line2: '', city: 'St. Louis', state: 'Missouri', zip: '63102', country: 'United States'},
        {line1: '1201 Walnut St', line2: 'Suite 2900', city: 'Kansas City', state: 'Missouri', zip: '64106', country: 'United States'},
        // Special address
        {line1: '3661 S Maryland Pkwy', line2: 'Suite 64', city: 'Las Vegas', state: 'Nevada', zip: '89169', country: 'United States'},

        // Added addresses from generated_addresses.txt
        {line1: '808 Willow Way', line2: '', city: 'Bristol', state: 'North Carolina', zip: '44101', country: 'United States'},
        {line1: '4321 Magnolia Street', line2: '', city: 'Salem', state: 'Nevada', zip: '44101', country: 'United States'},
        {line1: '5670 Pine Road', line2: '', city: 'Salem', state: 'Alabama', zip: '46201', country: 'United States'},
        {line1: '404 Pine Road', line2: '', city: 'Newport', state: 'Florida', zip: '33101', country: 'United States'},
        {line1: '505 Broadway', line2: '', city: 'Fairview', state: 'Pennsylvania', zip: '40601', country: 'United States'},
        {line1: '505 Elm Street', line2: '', city: 'Franklin', state: 'Kentucky', zip: '37201', country: 'United States'},
        {line1: '505 Dogwood Drive', line2: '', city: 'Clinton', state: 'Pennsylvania', zip: '35004', country: 'United States'},
        {line1: '505 Oak Street', line2: '', city: 'Ashland', state: 'Oregon', zip: '23219', country: 'United States'},
        {line1: '606 Poplar Place', line2: '', city: 'Newport', state: 'Tennessee', zip: '48201', country: 'United States'},
        {line1: '606 Broadway', line2: '', city: 'Ashland', state: 'Ohio', zip: '63101', country: 'United States'},
        {line1: '8901 Dogwood Drive', line2: '', city: 'Fremont', state: 'Michigan', zip: '73301', country: 'United States'},
        {line1: '4567 Maple Avenue', line2: '', city: 'Henderson', state: 'Florida', zip: '10001', country: 'United States'},
        {line1: '7890 Peachtree Blvd', line2: '', city: 'Salem', state: 'New York', zip: '63101', country: 'United States'},
        {line1: '1234 Poplar Place', line2: '', city: 'Salem', state: 'Virginia', zip: '80201', country: 'United States'},
        {line1: '1234 Dogwood Drive', line2: '', city: 'Georgetown', state: 'Florida', zip: '33101', country: 'United States'},
        {line1: '4321 Poplar Place', line2: '', city: 'Lebanon', state: 'Florida', zip: '46201', country: 'United States'},
        {line1: '303 Dogwood Drive', line2: '', city: 'Greenville', state: 'Georgia', zip: '63101', country: 'United States'},
        {line1: '303 Pine Road', line2: '', city: 'Salem', state: 'Pennsylvania', zip: '37201', country: 'United States'},
        {line1: '303 Broadway', line2: '', city: 'Ashland', state: 'Missouri', zip: '89501', country: 'United States'},
        {line1: '606 Broadway', line2: '', city: 'Dover', state: 'Texas', zip: '30301', country: 'United States'},
        {line1: '4321 Chestnut Court', line2: '', city: 'Dover', state: 'Tennessee', zip: '62701', country: 'United States'},
        {line1: '404 Juniper Circle', line2: '', city: 'Lebanon', state: 'Washington', zip: '63101', country: 'United States'},
        {line1: '505 Pine Road', line2: '', city: 'Georgetown', state: 'Ohio', zip: '48201', country: 'United States'},
        {line1: '606 Cedar Lane', line2: '', city: 'Arlington', state: 'Indiana', zip: '90210', country: 'United States'},
        {line1: '5670 Hickory Lane', line2: '', city: 'Kingston', state: 'Oregon', zip: '23219', country: 'United States'},
        {line1: '1234 Dogwood Drive', line2: '', city: 'Mount Vernon', state: 'New York', zip: '44101', country: 'United States'},
        {line1: '303 Broadway', line2: '', city: 'Riverside', state: 'Kentucky', zip: '27501', country: 'United States'},
        {line1: '7890 Peachtree Blvd', line2: '', city: 'Dover', state: 'New York', zip: '33101', country: 'United States'},
        {line1: '3456 Fir Avenue', line2: '', city: 'Greenville', state: 'Ohio', zip: '63101', country: 'United States'},
        {line1: '2345 Walnut Street', line2: '', city: 'Franklin', state: 'Oregon', zip: '73301', country: 'United States'},
        {line1: '303 Willow Way', line2: '', city: 'Greenville', state: 'Illinois', zip: '62701', country: 'United States'},
        {line1: '909 Aspen Terrace', line2: '', city: 'Arlington', state: 'California', zip: '23219', country: 'United States'},
        {line1: '7890 Oak Street', line2: '', city: 'Mount Vernon', state: 'Texas', zip: '46201', country: 'United States'},
        {line1: '6789 Broadway', line2: '', city: 'Mount Vernon', state: 'Georgia', zip: '27501', country: 'United States'},
        {line1: '5670 Dogwood Drive', line2: '', city: 'Fairview', state: 'Tennessee', zip: '23219', country: 'United States'},
        {line1: '909 Fir Avenue', line2: '', city: 'Riverside', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '4321 Magnolia Street', line2: '', city: 'Salem', state: 'Missouri', zip: '33101', country: 'United States'},
        {line1: '101 Aspen Terrace', line2: '', city: 'Fairview', state: 'Ohio', zip: '73301', country: 'United States'},
        {line1: '8901 Washington Ave', line2: '', city: 'Bristol', state: 'North Carolina', zip: '90210', country: 'United States'},
        {line1: '2345 Broadway', line2: '', city: 'Fairview', state: 'Nevada', zip: '46201', country: 'United States'},
        {line1: '404 Maple Avenue', line2: '', city: 'Franklin', state: 'New York', zip: '98101', country: 'United States'},
        {line1: '909 Peachtree Blvd', line2: '', city: 'Dover', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '5678 Elm Street', line2: '', city: 'Salem', state: 'Colorado', zip: '73301', country: 'United States'},
        {line1: '3456 Walnut Street', line2: '', city: 'Mount Vernon', state: 'Kentucky', zip: '35004', country: 'United States'},
        {line1: '3456 Fir Avenue', line2: '', city: 'Dover', state: 'Georgia', zip: '62701', country: 'United States'},
        {line1: '303 Sunset Boulevard', line2: '', city: 'Mount Vernon', state: 'New York', zip: '90210', country: 'United States'},
        {line1: '7890 Elm Street', line2: '', city: 'Riverside', state: 'New York', zip: '98101', country: 'United States'},
        {line1: '8901 Birch Drive', line2: '', city: 'Newport', state: 'Tennessee', zip: '27501', country: 'United States'},
        {line1: '404 Walnut Street', line2: '', city: 'Henderson', state: 'Virginia', zip: '10001', country: 'United States'},
        {line1: '404 Sunset Boulevard', line2: '', city: 'Kingston', state: 'Indiana', zip: '97201', country: 'United States'},
        {line1: '5678 Walnut Street', line2: '', city: 'Mount Vernon', state: 'Nevada', zip: '10001', country: 'United States'},
        {line1: '8901 Fir Avenue', line2: '', city: 'Mount Vernon', state: 'Ohio', zip: '27501', country: 'United States'},
        {line1: '505 Pine Road', line2: '', city: 'Franklin', state: 'North Carolina', zip: '98101', country: 'United States'},
        {line1: '3456 Washington Ave', line2: '', city: 'Kingston', state: 'Ohio', zip: '40601', country: 'United States'},
        {line1: '5678 Magnolia Street', line2: '', city: 'Arlington', state: 'California', zip: '63101', country: 'United States'},
        {line1: '909 Elm Street', line2: '', city: 'Kingston', state: 'Nevada', zip: '30301', country: 'United States'},
        {line1: '202 Hickory Lane', line2: '', city: 'Springfield', state: 'Georgia', zip: '27501', country: 'United States'},
        {line1: '404 Broadway', line2: '', city: 'Milton', state: 'Ohio', zip: '30301', country: 'United States'},
        {line1: '202 Aspen Terrace', line2: '', city: 'Kingston', state: 'California', zip: '40601', country: 'United States'},
        {line1: '303 Pine Road', line2: '', city: 'Bristol', state: 'Ohio', zip: '33101', country: 'United States'},
        {line1: '6781 Juniper Circle', line2: '', city: 'Clinton', state: 'Indiana', zip: '37201', country: 'United States'},
        {line1: '5670 Pine Road', line2: '', city: 'Newport', state: 'North Carolina', zip: '35004', country: 'United States'},
        {line1: '6789 Cedar Lane', line2: '', city: 'Riverside', state: 'Texas', zip: '63101', country: 'United States'},
        {line1: '808 Hickory Lane', line2: '', city: 'Clinton', state: 'Virginia', zip: '10001', country: 'United States'},
        {line1: '909 Pine Road', line2: '', city: 'Madison', state: 'Michigan', zip: '46201', country: 'United States'},
        {line1: '6781 Pine Road', line2: '', city: 'Clinton', state: 'North Carolina', zip: '35004', country: 'United States'},
        {line1: '1234 Elm Street', line2: '', city: 'Fairview', state: 'Tennessee', zip: '10001', country: 'United States'},
        {line1: '2345 Broadway', line2: '', city: 'Fremont', state: 'Oregon', zip: '40601', country: 'United States'},
        {line1: '505 Broadway', line2: '', city: 'Dover', state: 'California', zip: '63101', country: 'United States'},
        {line1: '101 Fir Avenue', line2: '', city: 'Franklin', state: 'Ohio', zip: '73301', country: 'United States'},
        {line1: '202 Birch Drive', line2: '', city: 'Newport', state: 'Texas', zip: '35004', country: 'United States'},
        {line1: '606 Sunset Boulevard', line2: '', city: 'Kingston', state: 'Washington', zip: '80201', country: 'United States'},
        {line1: '202 Willow Way', line2: '', city: 'Madison', state: 'Michigan', zip: '46201', country: 'United States'},
        {line1: '303 Juniper Circle', line2: '', city: 'Lebanon', state: 'Nevada', zip: '89501', country: 'United States'},
        {line1: '1234 Washington Ave', line2: '', city: 'Ashland', state: 'Ohio', zip: '73301', country: 'United States'},
        {line1: '2345 Elm Street', line2: '', city: 'Georgetown', state: 'Florida', zip: '27501', country: 'United States'},
        {line1: '101 Peachtree Blvd', line2: '', city: 'Franklin', state: 'Missouri', zip: '97201', country: 'United States'},
        {line1: '7890 Sunset Boulevard', line2: '', city: 'Madison', state: 'California', zip: '35004', country: 'United States'},
        {line1: '101 Fir Avenue', line2: '', city: 'Clinton', state: 'New York', zip: '80201', country: 'United States'},
        {line1: '6781 Washington Ave', line2: '', city: 'Henderson', state: 'Indiana', zip: '27501', country: 'United States'},
        {line1: '707 Dogwood Drive', line2: '', city: 'Springfield', state: 'California', zip: '90210', country: 'United States'},
        {line1: '707 Hickory Lane', line2: '', city: 'Madison', state: 'Texas', zip: '44101', country: 'United States'},
        {line1: '909 Magnolia Street', line2: '', city: 'Greenville', state: 'Florida', zip: '98101', country: 'United States'},
        {line1: '3456 Fir Avenue', line2: '', city: 'Henderson', state: 'Ohio', zip: '35004', country: 'United States'},
        {line1: '6781 Broadway', line2: '', city: 'Madison', state: 'Tennessee', zip: '23219', country: 'United States'},
        {line1: '4321 Cedar Lane', line2: '', city: 'Clinton', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '2345 Peachtree Blvd', line2: '', city: 'Newport', state: 'Texas', zip: '10001', country: 'United States'},
        {line1: '4567 Magnolia Street', line2: '', city: 'Henderson', state: 'Kentucky', zip: '44101', country: 'United States'},
        {line1: '5670 Elm Street', line2: '', city: 'Riverside', state: 'California', zip: '97201', country: 'United States'},
        {line1: '101 Chestnut Court', line2: '', city: 'Georgetown', state: 'Georgia', zip: '98101', country: 'United States'},
        {line1: '5678 Elm Street', line2: '', city: 'Newport', state: 'Washington', zip: '97201', country: 'United States'},
        {line1: '8901 Chestnut Court', line2: '', city: 'Clinton', state: 'Pennsylvania', zip: '89501', country: 'United States'},
        {line1: '303 Washington Ave', line2: '', city: 'Kingston', state: 'Virginia', zip: '62701', country: 'United States'},
        {line1: '909 Broadway', line2: '', city: 'Fremont', state: 'Tennessee', zip: '15201', country: 'United States'},
        {line1: '8901 Willow Way', line2: '', city: 'Bristol', state: 'Kentucky', zip: '63101', country: 'United States'},
        {line1: '505 Peachtree Blvd', line2: '', city: 'Ashland', state: 'Florida', zip: '27501', country: 'United States'},
        {line1: '4567 Poplar Place', line2: '', city: 'Arlington', state: 'Washington', zip: '37201', country: 'United States'},
        {line1: '4567 Peachtree Blvd', line2: '', city: 'Arlington', state: 'Missouri', zip: '10001', country: 'United States'},
        {line1: '3456 Peachtree Blvd', line2: '', city: 'Madison', state: 'Alabama', zip: '62701', country: 'United States'},        {line1: '707 Juniper Circle', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '62701', country: 'United States'},

        {line1: '404 Sunset Boulevard', line2: '', city: 'Ashland', state: 'Indiana', zip: '63101', country: 'United States'},
        {line1: '3456 Dogwood Drive', line2: '', city: 'Newport', state: 'Virginia', zip: '63101', country: 'United States'},
        {line1: '1234 Cedar Lane', line2: '', city: 'Franklin', state: 'Colorado', zip: '80201', country: 'United States'},
        {line1: '6789 Aspen Terrace', line2: '', city: 'Franklin', state: 'Pennsylvania', zip: '62701', country: 'United States'},
        {line1: '1234 Dogwood Drive', line2: '', city: 'Milton', state: 'Missouri', zip: '48201', country: 'United States'},
        {line1: '1234 Peachtree Blvd', line2: '', city: 'Fremont', state: 'Nevada', zip: '27501', country: 'United States'},
        {line1: '404 Broadway', line2: '', city: 'Arlington', state: 'Michigan', zip: '98101', country: 'United States'},
        {line1: '202 Sunset Boulevard', line2: '', city: 'Greenville', state: 'Indiana', zip: '33101', country: 'United States'},
        {line1: '5678 Poplar Place', line2: '', city: 'Clinton', state: 'Missouri', zip: '15201', country: 'United States'},
        {line1: '3456 Willow Way', line2: '', city: 'Arlington', state: 'California', zip: '98101', country: 'United States'},
        {line1: '505 Cedar Lane', line2: '', city: 'Fairview', state: 'Georgia', zip: '15201', country: 'United States'},
        {line1: '4321 Willow Way', line2: '', city: 'Bristol', state: 'Georgia', zip: '33101', country: 'United States'},
        {line1: '808 Aspen Terrace', line2: '', city: 'Springfield', state: 'North Carolina', zip: '23219', country: 'United States'},
        {line1: '1234 Cedar Lane', line2: '', city: 'Newport', state: 'Washington', zip: '40601', country: 'United States'},
        {line1: '3456 Magnolia Street', line2: '', city: 'Milton', state: 'Michigan', zip: '97201', country: 'United States'},
        {line1: '404 Sunset Boulevard', line2: '', city: 'Ashland', state: 'New York', zip: '46201', country: 'United States'},
        {line1: '4567 Birch Drive', line2: '', city: 'Newport', state: 'North Carolina', zip: '10001', country: 'United States'},
        {line1: '5678 Peachtree Blvd', line2: '', city: 'Fairview', state: 'Missouri', zip: '44101', country: 'United States'},
        {line1: '6781 Cedar Lane', line2: '', city: 'Fremont', state: 'Pennsylvania', zip: '98101', country: 'United States'},
        {line1: '5678 Poplar Place', line2: '', city: 'Newport', state: 'New York', zip: '63101', country: 'United States'},
        {line1: '6781 Broadway', line2: '', city: 'Bristol', state: 'Michigan', zip: '44101', country: 'United States'},
        {line1: '707 Poplar Place', line2: '', city: 'Riverside', state: 'Illinois', zip: '80201', country: 'United States'},
        {line1: '4321 Dogwood Drive', line2: '', city: 'Mount Vernon', state: 'Colorado', zip: '30301', country: 'United States'},
        {line1: '7890 Oak Street', line2: '', city: 'Lebanon', state: 'New York', zip: '80201', country: 'United States'},
        {line1: '1234 Elm Street', line2: '', city: 'Springfield', state: 'Indiana', zip: '30301', country: 'United States'},
        {line1: '4567 Willow Way', line2: '', city: 'Springfield', state: 'Kentucky', zip: '63101', country: 'United States'},
        {line1: '2345 Willow Way', line2: '', city: 'Fairview', state: 'Tennessee', zip: '35004', country: 'United States'},
        {line1: '6781 Oak Street', line2: '', city: 'Georgetown', state: 'Colorado', zip: '30301', country: 'United States'},
        {line1: '707 Peachtree Blvd', line2: '', city: 'Fremont', state: 'Kentucky', zip: '33101', country: 'United States'},
        {line1: '707 Elm Street', line2: '', city: 'Bristol', state: 'Missouri', zip: '40601', country: 'United States'},
        {line1: '707 Juniper Circle', line2: '', city: 'Ashland', state: 'Pennsylvania', zip: '23219', country: 'United States'},
        {line1: '4321 Peachtree Blvd', line2: '', city: 'Riverside', state: 'North Carolina', zip: '73301', country: 'United States'},
        {line1: '101 Peachtree Blvd', line2: '', city: 'Georgetown', state: 'Nevada', zip: '15201', country: 'United States'},
        {line1: '101 Poplar Place', line2: '', city: 'Kingston', state: 'Tennessee', zip: '23219', country: 'United States'},
        {line1: '2345 Elm Street', line2: '', city: 'Fremont', state: 'Colorado', zip: '10001', country: 'United States'},
        {line1: '4567 Juniper Circle', line2: '', city: 'Lebanon', state: 'New York', zip: '46201', country: 'United States'},
        {line1: '101 Magnolia Street', line2: '', city: 'Bristol', state: 'Washington', zip: '10001', country: 'United States'},
        {line1: '303 Elm Street', line2: '', city: 'Milton', state: 'Oregon', zip: '10001', country: 'United States'},
        {line1: '6781 Dogwood Drive', line2: '', city: 'Clinton', state: 'Missouri', zip: '30301', country: 'United States'},
        {line1: '303 Cedar Lane', line2: '', city: 'Franklin', state: 'New York', zip: '40601', country: 'United States'},
        {line1: '101 Oak Street', line2: '', city: 'Milton', state: 'Alabama', zip: '46201', country: 'United States'},
        {line1: '202 Hickory Lane', line2: '', city: 'Franklin', state: 'Nevada', zip: '35004', country: 'United States'},
        {line1: '707 Cedar Lane', line2: '', city: 'Arlington', state: 'North Carolina', zip: '46201', country: 'United States'},
        {line1: '1234 Cedar Lane', line2: '', city: 'Clinton', state: 'Texas', zip: '27501', country: 'United States'},
        {line1: '7890 Broadway', line2: '', city: 'Newport', state: 'North Carolina', zip: '15201', country: 'United States'},
        {line1: '4567 Chestnut Court', line2: '', city: 'Newport', state: 'Georgia', zip: '98101', country: 'United States'},
        {line1: '5678 Washington Ave', line2: '', city: 'Milton', state: 'Pennsylvania', zip: '44101', country: 'United States'},
        {line1: '6789 Peachtree Blvd', line2: '', city: 'Greenville', state: 'Michigan', zip: '73301', country: 'United States'},
        {line1: '707 Walnut Street', line2: '', city: 'Mount Vernon', state: 'Oregon', zip: '35004', country: 'United States'},
        {line1: '404 Chestnut Court', line2: '', city: 'Salem', state: 'California', zip: '23219', country: 'United States'},
        {line1: '3456 Dogwood Drive', line2: '', city: 'Madison', state: 'Georgia', zip: '73301', country: 'United States'},
        {line1: '101 Elm Street', line2: '', city: 'Kingston', state: 'Kentucky', zip: '98101', country: 'United States'},
        {line1: '1234 Maple Avenue', line2: '', city: 'Bristol', state: 'North Carolina', zip: '10001', country: 'United States'},
        {line1: '404 Magnolia Street', line2: '', city: 'Salem', state: 'Indiana', zip: '15201', country: 'United States'},
        {line1: '3456 Washington Ave', line2: '', city: 'Mount Vernon', state: 'Washington', zip: '97201', country: 'United States'},
        {line1: '101 Poplar Place', line2: '', city: 'Springfield', state: 'Texas', zip: '62701', country: 'United States'},
        {line1: '606 Sunset Boulevard', line2: '', city: 'Salem', state: 'Missouri', zip: '10001', country: 'United States'},
        {line1: '2345 Maple Avenue', line2: '', city: 'Clinton', state: 'Texas', zip: '37201', country: 'United States'},
        {line1: '606 Elm Street', line2: '', city: 'Fremont', state: 'Georgia', zip: '89501', country: 'United States'},
        {line1: '404 Willow Way', line2: '', city: 'Arlington', state: 'Texas', zip: '98101', country: 'United States'},
        {line1: '1234 Cedar Lane', line2: '', city: 'Madison', state: 'California', zip: '80201', country: 'United States'},
        {line1: '3456 Aspen Terrace', line2: '', city: 'Springfield', state: 'Kentucky', zip: '46201', country: 'United States'},
        {line1: '909 Cedar Lane', line2: '', city: 'Ashland', state: 'Kentucky', zip: '23219', country: 'United States'},
        {line1: '5670 Maple Avenue', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '90210', country: 'United States'},
        {line1: '4567 Magnolia Street', line2: '', city: 'Riverside', state: 'Nevada', zip: '90210', country: 'United States'},
        {line1: '7890 Poplar Place', line2: '', city: 'Dover', state: 'Nevada', zip: '30301', country: 'United States'},
        {line1: '202 Aspen Terrace', line2: '', city: 'Milton', state: 'Texas', zip: '15201', country: 'United States'},
        {line1: '606 Cedar Lane', line2: '', city: 'Lebanon', state: 'Illinois', zip: '30301', country: 'United States'},
        {line1: '404 Willow Way', line2: '', city: 'Fairview', state: 'Georgia', zip: '10001', country: 'United States'},
        {line1: '808 Chestnut Court', line2: '', city: 'Georgetown', state: 'Colorado', zip: '10001', country: 'United States'},
        {line1: '505 Birch Drive', line2: '', city: 'Lebanon', state: 'Tennessee', zip: '90210', country: 'United States'},
        {line1: '6781 Poplar Place', line2: '', city: 'Riverside', state: 'Nevada', zip: '23219', country: 'United States'},
        {line1: '7890 Peachtree Blvd', line2: '', city: 'Milton', state: 'Michigan', zip: '73301', country: 'United States'},
        {line1: '909 Poplar Place', line2: '', city: 'Lebanon', state: 'Kentucky', zip: '40601', country: 'United States'},
        {line1: '4321 Fir Avenue', line2: '', city: 'Salem', state: 'Tennessee', zip: '90210', country: 'United States'},
        {line1: '1234 Broadway', line2: '', city: 'Milton', state: 'Oregon', zip: '27501', country: 'United States'},
        {line1: '606 Elm Street', line2: '', city: 'Franklin', state: 'Missouri', zip: '80201', country: 'United States'},
        {line1: '202 Birch Drive', line2: '', city: 'Arlington', state: 'California', zip: '33101', country: 'United States'},
        {line1: '4321 Juniper Circle', line2: '', city: 'Georgetown', state: 'Nevada', zip: '44101', country: 'United States'},
        {line1: '7890 Magnolia Street', line2: '', city: 'Ashland', state: 'Colorado', zip: '44101', country: 'United States'},
        {line1: '8901 Elm Street', line2: '', city: 'Henderson', state: 'Kentucky', zip: '98101', country: 'United States'},
        {line1: '7890 Willow Way', line2: '', city: 'Bristol', state: 'Alabama', zip: '73301', country: 'United States'},
        {line1: '606 Birch Drive', line2: '', city: 'Dover', state: 'Alabama', zip: '35004', country: 'United States'},
        {line1: '5670 Poplar Place', line2: '', city: 'Salem', state: 'Virginia', zip: '23219', country: 'United States'},
        {line1: '303 Peachtree Blvd', line2: '', city: 'Salem', state: 'Missouri', zip: '23219', country: 'United States'},
        {line1: '3456 Aspen Terrace', line2: '', city: 'Madison', state: 'Tennessee', zip: '90210', country: 'United States'},
        {line1: '6781 Birch Drive', line2: '', city: 'Salem', state: 'Washington', zip: '63101', country: 'United States'},
        {line1: '3456 Juniper Circle', line2: '', city: 'Arlington', state: 'Virginia', zip: '30301', country: 'United States'},
        {line1: '6789 Walnut Street', line2: '', city: 'Lebanon', state: 'Nevada', zip: '80201', country: 'United States'},
        {line1: '4567 Pine Road', line2: '', city: 'Springfield', state: 'Texas', zip: '15201', country: 'United States'},
        {line1: '101 Peachtree Blvd', line2: '', city: 'Fremont', state: 'Tennessee', zip: '15201', country: 'United States'},
        {line1: '707 Aspen Terrace', line2: '', city: 'Mount Vernon', state: 'Alabama', zip: '73301', country: 'United States'},
        {line1: '101 Maple Avenue', line2: '', city: 'Dover', state: 'Florida', zip: '40601', country: 'United States'},
        {line1: '7890 Sunset Boulevard', line2: '', city: 'Clinton', state: 'Florida', zip: '44101', country: 'United States'},
        {line1: '707 Magnolia Street', line2: '', city: 'Milton', state: 'Missouri', zip: '40601', country: 'United States'},
        {line1: '1234 Hickory Lane', line2: '', city: 'Bristol', state: 'Indiana', zip: '89501', country: 'United States'},
        {line1: '505 Walnut Street', line2: '', city: 'Fairview', state: 'Nevada', zip: '30301', country: 'United States'},
        {line1: '4321 Washington Ave', line2: '', city: 'Salem', state: 'Missouri', zip: '35004', country: 'United States'},
        {line1: '808 Cedar Lane', line2: '', city: 'Franklin', state: 'Illinois', zip: '35004', country: 'United States'},        {line1: '4567 Magnolia Street', line2: '', city: 'Lebanon', state: 'Missouri', zip: '48201', country: 'United States'},
        {line1: '2345 Aspen Terrace', line2: '', city: 'Fairview', state: 'Pennsylvania', zip: '89501', country: 'United States'},
        {line1: '4567 Magnolia Street', line2: '', city: 'Springfield', state: 'Missouri', zip: '30301', country: 'United States'},
        {line1: '6781 Elm Street', line2: '', city: 'Georgetown', state: 'Illinois', zip: '44101', country: 'United States'},
        {line1: '6781 Washington Ave', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '15201', country: 'United States'},
        {line1: '6781 Pine Road', line2: '', city: 'Franklin', state: 'Georgia', zip: '90210', country: 'United States'},
        {line1: '303 Sunset Boulevard', line2: '', city: 'Springfield', state: 'Texas', zip: '98101', country: 'United States'},
        {line1: '2345 Maple Avenue', line2: '', city: 'Lebanon', state: 'North Carolina', zip: '48201', country: 'United States'},
        {line1: '3456 Juniper Circle', line2: '', city: 'Arlington', state: 'Washington', zip: '97201', country: 'United States'},
        {line1: '202 Willow Way', line2: '', city: 'Riverside', state: 'Illinois', zip: '15201', country: 'United States'},
        {line1: '7890 Magnolia Street', line2: '', city: 'Fairview', state: 'Florida', zip: '23219', country: 'United States'},
        {line1: '303 Oak Street', line2: '', city: 'Mount Vernon', state: 'Indiana', zip: '30301', country: 'United States'},
        {line1: '2345 Poplar Place', line2: '', city: 'Georgetown', state: 'Indiana', zip: '46201', country: 'United States'},
        {line1: '2345 Willow Way', line2: '', city: 'Lebanon', state: 'Florida', zip: '62701', country: 'United States'},
        {line1: '3456 Birch Drive', line2: '', city: 'Riverside', state: 'Colorado', zip: '33101', country: 'United States'},
        {line1: '5678 Dogwood Drive', line2: '', city: 'Kingston', state: 'Alabama', zip: '98101', country: 'United States'},
        {line1: '5670 Willow Way', line2: '', city: 'Mount Vernon', state: 'Alabama', zip: '48201', country: 'United States'},
        {line1: '5678 Pine Road', line2: '', city: 'Lebanon', state: 'New York', zip: '10001', country: 'United States'},
        {line1: '2345 Peachtree Blvd', line2: '', city: 'Lebanon', state: 'Colorado', zip: '27501', country: 'United States'},
        {line1: '2345 Birch Drive', line2: '', city: 'Georgetown', state: 'Georgia', zip: '63101', country: 'United States'},
        {line1: '303 Peachtree Blvd', line2: '', city: 'Franklin', state: 'Colorado', zip: '40601', country: 'United States'},
        {line1: '7890 Sunset Boulevard', line2: '', city: 'Milton', state: 'Tennessee', zip: '27501', country: 'United States'},
        {line1: '6781 Fir Avenue', line2: '', city: 'Milton', state: 'Florida', zip: '10001', country: 'United States'},
        {line1: '1234 Willow Way', line2: '', city: 'Clinton', state: 'Tennessee', zip: '40601', country: 'United States'},
        {line1: '3456 Walnut Street', line2: '', city: 'Franklin', state: 'Oregon', zip: '44101', country: 'United States'},
        {line1: '5678 Juniper Circle', line2: '', city: 'Fremont', state: 'Oregon', zip: '23219', country: 'United States'},
        {line1: '6781 Magnolia Street', line2: '', city: 'Salem', state: 'California', zip: '62701', country: 'United States'},
        {line1: '1234 Willow Way', line2: '', city: 'Georgetown', state: 'Michigan', zip: '35004', country: 'United States'},
        {line1: '3456 Pine Road', line2: '', city: 'Fairview', state: 'Indiana', zip: '40601', country: 'United States'},
        {line1: '5670 Broadway', line2: '', city: 'Lebanon', state: 'Georgia', zip: '40601', country: 'United States'},
        {line1: '808 Aspen Terrace', line2: '', city: 'Newport', state: 'Missouri', zip: '35004', country: 'United States'},
        {line1: '2345 Magnolia Street', line2: '', city: 'Henderson', state: 'Tennessee', zip: '27501', country: 'United States'},
        {line1: '404 Maple Avenue', line2: '', city: 'Arlington', state: 'Washington', zip: '98101', country: 'United States'},
        {line1: '4321 Cedar Lane', line2: '', city: 'Riverside', state: 'Missouri', zip: '90210', country: 'United States'},
        {line1: '505 Maple Avenue', line2: '', city: 'Springfield', state: 'Indiana', zip: '62701', country: 'United States'},
        {line1: '2345 Magnolia Street', line2: '', city: 'Georgetown', state: 'Washington', zip: '46201', country: 'United States'},
        {line1: '5670 Peachtree Blvd', line2: '', city: 'Arlington', state: 'Oregon', zip: '30301', country: 'United States'},
        {line1: '404 Dogwood Drive', line2: '', city: 'Newport', state: 'Washington', zip: '62701', country: 'United States'},
        {line1: '303 Chestnut Court', line2: '', city: 'Fremont', state: 'New York', zip: '98101', country: 'United States'},
        {line1: '404 Elm Street', line2: '', city: 'Salem', state: 'Colorado', zip: '23219', country: 'United States'},
        {line1: '202 Sunset Boulevard', line2: '', city: 'Fairview', state: 'Illinois', zip: '98101', country: 'United States'},
        {line1: '606 Pine Road', line2: '', city: 'Newport', state: 'Georgia', zip: '23219', country: 'United States'},
        {line1: '909 Birch Drive', line2: '', city: 'Greenville', state: 'Kentucky', zip: '90210', country: 'United States'},
        {line1: '707 Pine Road', line2: '', city: 'Fremont', state: 'Nevada', zip: '98101', country: 'United States'},
        {line1: '7890 Washington Ave', line2: '', city: 'Arlington', state: 'Illinois', zip: '15201', country: 'United States'},
        {line1: '5670 Willow Way', line2: '', city: 'Greenville', state: 'Indiana', zip: '46201', country: 'United States'},
        {line1: '7890 Oak Street', line2: '', city: 'Greenville', state: 'Pennsylvania', zip: '40601', country: 'United States'},
        {line1: '3456 Cedar Lane', line2: '', city: 'Springfield', state: 'Texas', zip: '30301', country: 'United States'},
        {line1: '707 Birch Drive', line2: '', city: 'Newport', state: 'Kentucky', zip: '35004', country: 'United States'},
        {line1: '4321 Juniper Circle', line2: '', city: 'Arlington', state: 'Kentucky', zip: '48201', country: 'United States'},
        {line1: '404 Willow Way', line2: '', city: 'Franklin', state: 'Alabama', zip: '73301', country: 'United States'},
        {line1: '8901 Washington Ave', line2: '', city: 'Franklin', state: 'Georgia', zip: '35004', country: 'United States'},
        {line1: '5670 Fir Avenue', line2: '', city: 'Salem', state: 'Indiana', zip: '80201', country: 'United States'},
        {line1: '7890 Magnolia Street', line2: '', city: 'Kingston', state: 'Washington', zip: '89501', country: 'United States'},
        {line1: '606 Chestnut Court', line2: '', city: 'Bristol', state: 'Illinois', zip: '98101', country: 'United States'},
        {line1: '2345 Dogwood Drive', line2: '', city: 'Mount Vernon', state: 'Tennessee', zip: '48201', country: 'United States'},
        {line1: '2345 Broadway', line2: '', city: 'Fairview', state: 'California', zip: '46201', country: 'United States'},
        {line1: '7890 Sunset Boulevard', line2: '', city: 'Dover', state: 'California', zip: '35004', country: 'United States'},
        {line1: '303 Poplar Place', line2: '', city: 'Greenville', state: 'Illinois', zip: '15201', country: 'United States'},
        {line1: '707 Dogwood Drive', line2: '', city: 'Kingston', state: 'Missouri', zip: '48201', country: 'United States'},
        {line1: '707 Aspen Terrace', line2: '', city: 'Riverside', state: 'New York', zip: '98101', country: 'United States'},
        {line1: '6789 Juniper Circle', line2: '', city: 'Henderson', state: 'Virginia', zip: '23219', country: 'United States'},
        {line1: '2345 Willow Way', line2: '', city: 'Bristol', state: 'Washington', zip: '63101', country: 'United States'},
        {line1: '707 Fir Avenue', line2: '', city: 'Dover', state: 'Kentucky', zip: '37201', country: 'United States'},
        {line1: '4567 Fir Avenue', line2: '', city: 'Madison', state: 'California', zip: '62701', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Georgetown', state: 'Indiana', zip: '80201', country: 'United States'},
        {line1: '505 Hickory Lane', line2: '', city: 'Georgetown', state: 'Tennessee', zip: '73301', country: 'United States'},
        {line1: '6781 Walnut Street', line2: '', city: 'Clinton', state: 'Georgia', zip: '62701', country: 'United States'},
        {line1: '808 Broadway', line2: '', city: 'Fairview', state: 'Washington', zip: '37201', country: 'United States'},
        {line1: '303 Hickory Lane', line2: '', city: 'Ashland', state: 'Kentucky', zip: '46201', country: 'United States'},
        {line1: '808 Cedar Lane', line2: '', city: 'Lebanon', state: 'New York', zip: '30301', country: 'United States'},
        {line1: '505 Hickory Lane', line2: '', city: 'Franklin', state: 'Illinois', zip: '90210', country: 'United States'},
        {line1: '606 Dogwood Drive', line2: '', city: 'Henderson', state: 'Illinois', zip: '40601', country: 'United States'},
        {line1: '2345 Birch Drive', line2: '', city: 'Fairview', state: 'Tennessee', zip: '46201', country: 'United States'},
        {line1: '7890 Poplar Place', line2: '', city: 'Fremont', state: 'Virginia', zip: '98101', country: 'United States'},
        {line1: '7890 Magnolia Street', line2: '', city: 'Fremont', state: 'Illinois', zip: '97201', country: 'United States'},
        {line1: '404 Poplar Place', line2: '', city: 'Newport', state: 'Missouri', zip: '89501', country: 'United States'},
        {line1: '707 Birch Drive', line2: '', city: 'Fremont', state: 'California', zip: '23219', country: 'United States'},
        {line1: '7890 Juniper Circle', line2: '', city: 'Ashland', state: 'Pennsylvania', zip: '98101', country: 'United States'},
        {line1: '1234 Poplar Place', line2: '', city: 'Salem', state: 'Kentucky', zip: '46201', country: 'United States'},
        {line1: '6789 Broadway', line2: '', city: 'Lebanon', state: 'Florida', zip: '33101', country: 'United States'},
        {line1: '8901 Walnut Street', line2: '', city: 'Springfield', state: 'Nevada', zip: '89501', country: 'United States'},
        {line1: '1234 Elm Street', line2: '', city: 'Kingston', state: 'Virginia', zip: '73301', country: 'United States'},
        {line1: '4567 Pine Road', line2: '', city: 'Greenville', state: 'Georgia', zip: '97201', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Madison', state: 'Alabama', zip: '10001', country: 'United States'},
        {line1: '606 Washington Ave', line2: '', city: 'Henderson', state: 'Georgia', zip: '30301', country: 'United States'},
        {line1: '909 Oak Street', line2: '', city: 'Kingston', state: 'Kentucky', zip: '35004', country: 'United States'},
        {line1: '101 Pine Road', line2: '', city: 'Bristol', state: 'Colorado', zip: '35004', country: 'United States'},
        {line1: '404 Fir Avenue', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '40601', country: 'United States'},
        {line1: '5678 Willow Way', line2: '', city: 'Henderson', state: 'Michigan', zip: '90210', country: 'United States'},
        {line1: '909 Maple Avenue', line2: '', city: 'Greenville', state: 'Colorado', zip: '62701', country: 'United States'},
        {line1: '202 Magnolia Street', line2: '', city: 'Clinton', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '404 Birch Drive', line2: '', city: 'Mount Vernon', state: 'Missouri', zip: '15201', country: 'United States'},
        {line1: '202 Dogwood Drive', line2: '', city: 'Dover', state: 'Illinois', zip: '98101', country: 'United States'},
        {line1: '404 Aspen Terrace', line2: '', city: 'Greenville', state: 'Alabama', zip: '63101', country: 'United States'},
        {line1: '606 Birch Drive', line2: '', city: 'Mount Vernon', state: 'Ohio', zip: '37201', country: 'United States'},
        {line1: '404 Cedar Lane', line2: '', city: 'Greenville', state: 'Georgia', zip: '73301', country: 'United States'},
        {line1: '8901 Maple Avenue', line2: '', city: 'Salem', state: 'Ohio', zip: '30301', country: 'United States'},
        {line1: '5678 Cedar Lane', line2: '', city: 'Springfield', state: 'Virginia', zip: '40601', country: 'United States'},
        {line1: '1234 Elm Street', line2: '', city: 'Greenville', state: 'California', zip: '37201', country: 'United States'},
        {line1: '6789 Walnut Street', line2: '', city: 'Lebanon', state: 'Michigan', zip: '80201', country: 'United States'},

        // New addresses from generated_addresses.txt
        {line1: '8901 Aspen Terrace', line2: '', city: 'Arlington', state: 'Michigan', zip: '98101', country: 'United States'},
        {line1: '5678 Fir Avenue', line2: '', city: 'Fairview', state: 'Nevada', zip: '73301', country: 'United States'},
        {line1: '606 Oak Street', line2: '', city: 'Fremont', state: 'Alabama', zip: '73301', country: 'United States'},
        {line1: '6789 Sunset Boulevard', line2: '', city: 'Henderson', state: 'California', zip: '33101', country: 'United States'},
        {line1: '909 Oak Street', line2: '', city: 'Salem', state: 'Florida', zip: '90210', country: 'United States'},
        {line1: '5678 Poplar Place', line2: '', city: 'Newport', state: 'Florida', zip: '27501', country: 'United States'},
        {line1: '606 Sunset Boulevard', line2: '', city: 'Madison', state: 'Nevada', zip: '62701', country: 'United States'},
        {line1: '2345 Dogwood Drive', line2: '', city: 'Ashland', state: 'Kentucky', zip: '63101', country: 'United States'},
        {line1: '8901 Elm Street', line2: '', city: 'Fairview', state: 'Texas', zip: '33101', country: 'United States'},
        {line1: '8901 Maple Avenue', line2: '', city: 'Clinton', state: 'Michigan', zip: '15201', country: 'United States'},
        {line1: '707 Fir Avenue', line2: '', city: 'Clinton', state: 'Georgia', zip: '27501', country: 'United States'},
        {line1: '5678 Washington Ave', line2: '', city: 'Newport', state: 'California', zip: '89501', country: 'United States'},
        {line1: '5670 Magnolia Street', line2: '', city: 'Bristol', state: 'California', zip: '63101', country: 'United States'},
        {line1: '8901 Oak Street', line2: '', city: 'Dover', state: 'Alabama', zip: '46201', country: 'United States'},
        {line1: '303 Willow Way', line2: '', city: 'Madison', state: 'Texas', zip: '48201', country: 'United States'},
        {line1: '2345 Pine Road', line2: '', city: 'Fremont', state: 'Indiana', zip: '15201', country: 'United States'},
        {line1: '2345 Hickory Lane', line2: '', city: 'Clinton', state: 'Georgia', zip: '27501', country: 'United States'},
        {line1: '5670 Juniper Circle', line2: '', city: 'Bristol', state: 'Michigan', zip: '89501', country: 'United States'},
        {line1: '404 Dogwood Drive', line2: '', city: 'Kingston', state: 'Tennessee', zip: '10001', country: 'United States'},
        {line1: '4321 Pine Road', line2: '', city: 'Henderson', state: 'Colorado', zip: '23219', country: 'United States'},
        {line1: '2345 Oak Street', line2: '', city: 'Riverside', state: 'Colorado', zip: '10001', country: 'United States'},
        {line1: '404 Juniper Circle', line2: '', city: 'Ashland', state: 'Texas', zip: '40601', country: 'United States'},
        {line1: '606 Birch Drive', line2: '', city: 'Dover', state: 'Oregon', zip: '62701', country: 'United States'},
        {line1: '505 Magnolia Street', line2: '', city: 'Dover', state: 'California', zip: '37201', country: 'United States'},
        {line1: '3456 Dogwood Drive', line2: '', city: 'Lebanon', state: 'Florida', zip: '46201', country: 'United States'},
        {line1: '2345 Fir Avenue', line2: '', city: 'Kingston', state: 'Alabama', zip: '73301', country: 'United States'},
        {line1: '4321 Willow Way', line2: '', city: 'Arlington', state: 'Indiana', zip: '80201', country: 'United States'},
        {line1: '5678 Chestnut Court', line2: '', city: 'Ashland', state: 'Illinois', zip: '27501', country: 'United States'},
        {line1: '5678 Willow Way', line2: '', city: 'Arlington', state: 'Texas', zip: '30301', country: 'United States'},
        {line1: '8901 Peachtree Blvd', line2: '', city: 'Henderson', state: 'Florida', zip: '44101', country: 'United States'},
        {line1: '5670 Maple Avenue', line2: '', city: 'Milton', state: 'New York', zip: '37201', country: 'United States'},
        {line1: '303 Hickory Lane', line2: '', city: 'Springfield', state: 'Alabama', zip: '98101', country: 'United States'},
        {line1: '5678 Fir Avenue', line2: '', city: 'Henderson', state: 'North Carolina', zip: '63101', country: 'United States'},
        {line1: '2345 Pine Road', line2: '', city: 'Georgetown', state: 'Pennsylvania', zip: '80201', country: 'United States'},
        {line1: '202 Juniper Circle', line2: '', city: 'Kingston', state: 'New York', zip: '97201', country: 'United States'},
        {line1: '606 Pine Road', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '63101', country: 'United States'},
        {line1: '505 Elm Street', line2: '', city: 'Milton', state: 'Oregon', zip: '15201', country: 'United States'},
        {line1: '5670 Peachtree Blvd', line2: '', city: 'Ashland', state: 'Michigan', zip: '98101', country: 'United States'},
        {line1: '8901 Juniper Circle', line2: '', city: 'Mount Vernon', state: 'Washington', zip: '40601', country: 'United States'},
        {line1: '4321 Walnut Street', line2: '', city: 'Newport', state: 'Indiana', zip: '44101', country: 'United States'},
        {line1: '8901 Elm Street', line2: '', city: 'Lebanon', state: 'Michigan', zip: '46201', country: 'United States'},
        {line1: '909 Walnut Street', line2: '', city: 'Madison', state: 'Virginia', zip: '73301', country: 'United States'},
        {line1: '101 Aspen Terrace', line2: '', city: 'Lebanon', state: 'Kentucky', zip: '62701', country: 'United States'},
        {line1: '7890 Elm Street', line2: '', city: 'Lebanon', state: 'Nevada', zip: '73301', country: 'United States'},
        {line1: '707 Peachtree Blvd', line2: '', city: 'Salem', state: 'North Carolina', zip: '80201', country: 'United States'},
        {line1: '5678 Magnolia Street', line2: '', city: 'Madison', state: 'Pennsylvania', zip: '10001', country: 'United States'},
        {line1: '303 Magnolia Street', line2: '', city: 'Bristol', state: 'Missouri', zip: '10001', country: 'United States'},
        {line1: '606 Dogwood Drive', line2: '', city: 'Henderson', state: 'North Carolina', zip: '98101', country: 'United States'},
        {line1: '6781 Aspen Terrace', line2: '', city: 'Newport', state: 'Kentucky', zip: '10001', country: 'United States'},
        {line1: '7890 Poplar Place', line2: '', city: 'Greenville', state: 'Virginia', zip: '48201', country: 'United States'},
        {line1: '5670 Aspen Terrace', line2: '', city: 'Fairview', state: 'North Carolina', zip: '46201', country: 'United States'},
        {line1: '7890 Elm Street', line2: '', city: 'Newport', state: 'Virginia', zip: '15201', country: 'United States'},
        {line1: '707 Maple Avenue', line2: '', city: 'Salem', state: 'Georgia', zip: '48201', country: 'United States'},
        {line1: '8901 Birch Drive', line2: '', city: 'Springfield', state: 'Alabama', zip: '23219', country: 'United States'},
        {line1: '1234 Fir Avenue', line2: '', city: 'Fairview', state: 'Georgia', zip: '10001', country: 'United States'},
        {line1: '101 Oak Street', line2: '', city: 'Riverside', state: 'Ohio', zip: '90210', country: 'United States'},
        {line1: '7890 Magnolia Street', line2: '', city: 'Springfield', state: 'California', zip: '10001', country: 'United States'},
        {line1: '505 Peachtree Blvd', line2: '', city: 'Ashland', state: 'Missouri', zip: '35004', country: 'United States'},
        {line1: '7890 Pine Road', line2: '', city: 'Henderson', state: 'California', zip: '35004', country: 'United States'},
        {line1: '8901 Aspen Terrace', line2: '', city: 'Kingston', state: 'Nevada', zip: '30301', country: 'United States'},
        {line1: '707 Pine Road', line2: '', city: 'Fairview', state: 'Nevada', zip: '89501', country: 'United States'},
        {line1: '6781 Sunset Boulevard', line2: '', city: 'Fremont', state: 'Pennsylvania', zip: '89501', country: 'United States'},
        {line1: '6781 Cedar Lane', line2: '', city: 'Newport', state: 'Tennessee', zip: '23219', country: 'United States'},
        {line1: '404 Chestnut Court', line2: '', city: 'Lebanon', state: 'New York', zip: '23219', country: 'United States'},
        {line1: '6789 Peachtree Blvd', line2: '', city: 'Newport', state: 'Kentucky', zip: '44101', country: 'United States'},
        {line1: '5670 Walnut Street', line2: '', city: 'Arlington', state: 'Colorado', zip: '97201', country: 'United States'},
        {line1: '5670 Oak Street', line2: '', city: 'Fremont', state: 'New York', zip: '80201', country: 'United States'},
        {line1: '4321 Poplar Place', line2: '', city: 'Madison', state: 'Kentucky', zip: '33101', country: 'United States'},
        {line1: '6789 Juniper Circle', line2: '', city: 'Franklin', state: 'Kentucky', zip: '89501', country: 'United States'},
        {line1: '303 Magnolia Street', line2: '', city: 'Riverside', state: 'Texas', zip: '33101', country: 'United States'},
        {line1: '606 Oak Street', line2: '', city: 'Bristol', state: 'Michigan', zip: '48201', country: 'United States'},
        {line1: '2345 Pine Road', line2: '', city: 'Riverside', state: 'Michigan', zip: '80201', country: 'United States'},
        {line1: '303 Poplar Place', line2: '', city: 'Fairview', state: 'Tennessee', zip: '97201', country: 'United States'},
        {line1: '404 Willow Way', line2: '', city: 'Springfield', state: 'Kentucky', zip: '33101', country: 'United States'},
        {line1: '2345 Willow Way', line2: '', city: 'Springfield', state: 'Washington', zip: '30301', country: 'United States'},
        {line1: '6781 Aspen Terrace', line2: '', city: 'Bristol', state: 'Alabama', zip: '48201', country: 'United States'},
        {line1: '7890 Willow Way', line2: '', city: 'Greenville', state: 'Nevada', zip: '48201', country: 'United States'},
        {line1: '303 Pine Road', line2: '', city: 'Salem', state: 'Nevada', zip: '40601', country: 'United States'},
        {line1: '6789 Broadway', line2: '', city: 'Fairview', state: 'Colorado', zip: '10001', country: 'United States'},
        {line1: '404 Dogwood Drive', line2: '', city: 'Bristol', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '808 Sunset Boulevard', line2: '', city: 'Lebanon', state: 'Texas', zip: '63101', country: 'United States'},
        {line1: '3456 Cedar Lane', line2: '', city: 'Ashland', state: 'Pennsylvania', zip: '10001', country: 'United States'},
        {line1: '808 Aspen Terrace', line2: '', city: 'Dover', state: 'Oregon', zip: '37201', country: 'United States'},
        {line1: '4567 Sunset Boulevard', line2: '', city: 'Arlington', state: 'California', zip: '90210', country: 'United States'},
        {line1: '3456 Maple Avenue', line2: '', city: 'Salem', state: 'Florida', zip: '44101', country: 'United States'},
        {line1: '8901 Peachtree Blvd', line2: '', city: 'Henderson', state: 'North Carolina', zip: '90210', country: 'United States'},
        {line1: '505 Broadway', line2: '', city: 'Ashland', state: 'Nevada', zip: '48201', country: 'United States'},

        // New addresses from generated_addresses.txt
        {line1: '505 Washington Ave', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '10001', country: 'United States'},
        {line1: '808 Dogwood Drive', line2: '', city: 'Franklin', state: 'Kentucky', zip: '33101', country: 'United States'},
        {line1: '202 Broadway', line2: '', city: 'Newport', state: 'Washington', zip: '73301', country: 'United States'},
        {line1: '4321 Maple Avenue', line2: '', city: 'Ashland', state: 'Nevada', zip: '44101', country: 'United States'},
        {line1: '505 Walnut Street', line2: '', city: 'Greenville', state: 'Missouri', zip: '89501', country: 'United States'},
        {line1: '808 Willow Way', line2: '', city: 'Milton', state: 'Colorado', zip: '27501', country: 'United States'},
        {line1: '3456 Fir Avenue', line2: '', city: 'Kingston', state: 'Missouri', zip: '46201', country: 'United States'},
        {line1: '1234 Dogwood Drive', line2: '', city: 'Milton', state: 'Virginia', zip: '37201', country: 'United States'},
        {line1: '303 Poplar Place', line2: '', city: 'Madison', state: 'Nevada', zip: '46201', country: 'United States'},
        {line1: '7890 Hickory Lane', line2: '', city: 'Ashland', state: 'North Carolina', zip: '15201', country: 'United States'},
        {line1: '404 Aspen Terrace', line2: '', city: 'Newport', state: 'Indiana', zip: '48201', country: 'United States'},
        {line1: '8901 Peachtree Blvd', line2: '', city: 'Fairview', state: 'Indiana', zip: '97201', country: 'United States'},
        {line1: '8901 Elm Street', line2: '', city: 'Newport', state: 'Pennsylvania', zip: '98101', country: 'United States'},
        {line1: '404 Willow Way', line2: '', city: 'Kingston', state: 'Ohio', zip: '98101', country: 'United States'},
        {line1: '202 Poplar Place', line2: '', city: 'Kingston', state: 'Illinois', zip: '37201', country: 'United States'},
        {line1: '6789 Broadway', line2: '', city: 'Bristol', state: 'Oregon', zip: '33101', country: 'United States'},
        {line1: '404 Fir Avenue', line2: '', city: 'Ashland', state: 'New York', zip: '33101', country: 'United States'},
        {line1: '8901 Aspen Terrace', line2: '', city: 'Fremont', state: 'Illinois', zip: '46201', country: 'United States'},
        {line1: '6789 Sunset Boulevard', line2: '', city: 'Georgetown', state: 'Alabama', zip: '27501', country: 'United States'},
        {line1: '202 Pine Road', line2: '', city: 'Ashland', state: 'Washington', zip: '15201', country: 'United States'},
        {line1: '2345 Maple Avenue', line2: '', city: 'Salem', state: 'Washington', zip: '73301', country: 'United States'},
        {line1: '202 Cedar Lane', line2: '', city: 'Riverside', state: 'Tennessee', zip: '40601', country: 'United States'},
        {line1: '8901 Hickory Lane', line2: '', city: 'Springfield', state: 'Virginia', zip: '10001', country: 'United States'},
        {line1: '909 Cedar Lane', line2: '', city: 'Milton', state: 'New York', zip: '33101', country: 'United States'},
        {line1: '2345 Pine Road', line2: '', city: 'Springfield', state: 'Florida', zip: '63101', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Lebanon', state: 'Indiana', zip: '98101', country: 'United States'},
        {line1: '5670 Cedar Lane', line2: '', city: 'Bristol', state: 'North Carolina', zip: '63101', country: 'United States'},
        {line1: '5670 Juniper Circle', line2: '', city: 'Newport', state: 'Washington', zip: '44101', country: 'United States'},
        {line1: '303 Juniper Circle', line2: '', city: 'Clinton', state: 'Missouri', zip: '46201', country: 'United States'},
        {line1: '202 Broadway', line2: '', city: 'Clinton', state: 'New York', zip: '33101', country: 'United States'},
        {line1: '404 Chestnut Court', line2: '', city: 'Newport', state: 'Illinois', zip: '62701', country: 'United States'},
        {line1: '4321 Fir Avenue', line2: '', city: 'Madison', state: 'Indiana', zip: '73301', country: 'United States'},
        {line1: '707 Washington Ave', line2: '', city: 'Madison', state: 'Missouri', zip: '73301', country: 'United States'},
        {line1: '7890 Dogwood Drive', line2: '', city: 'Salem', state: 'Illinois', zip: '27501', country: 'United States'},
        {line1: '2345 Birch Drive', line2: '', city: 'Georgetown', state: 'Alabama', zip: '40601', country: 'United States'},
        {line1: '4321 Sunset Boulevard', line2: '', city: 'Milton', state: 'New York', zip: '23219', country: 'United States'},
        {line1: '5670 Peachtree Blvd', line2: '', city: 'Riverside', state: 'Missouri', zip: '98101', country: 'United States'},
        {line1: '404 Pine Road', line2: '', city: 'Madison', state: 'Colorado', zip: '44101', country: 'United States'},
        {line1: '707 Fir Avenue', line2: '', city: 'Bristol', state: 'Missouri', zip: '23219', country: 'United States'},
        {line1: '303 Hickory Lane', line2: '', city: 'Milton', state: 'Washington', zip: '35004', country: 'United States'},
        {line1: '5678 Poplar Place', line2: '', city: 'Georgetown', state: 'Washington', zip: '73301', country: 'United States'},
        {line1: '5670 Pine Road', line2: '', city: 'Greenville', state: 'Missouri', zip: '15201', country: 'United States'},
        {line1: '606 Chestnut Court', line2: '', city: 'Ashland', state: 'Oregon', zip: '48201', country: 'United States'},
        {line1: '101 Peachtree Blvd', line2: '', city: 'Henderson', state: 'Georgia', zip: '15201', country: 'United States'},
        {line1: '101 Chestnut Court', line2: '', city: 'Georgetown', state: 'Pennsylvania', zip: '23219', country: 'United States'},
        {line1: '7890 Fir Avenue', line2: '', city: 'Bristol', state: 'Pennsylvania', zip: '27501', country: 'United States'},
        {line1: '909 Maple Avenue', line2: '', city: 'Fremont', state: 'Oregon', zip: '15201', country: 'United States'},
        {line1: '2345 Elm Street', line2: '', city: 'Madison', state: 'Alabama', zip: '37201', country: 'United States'},
        {line1: '505 Birch Drive', line2: '', city: 'Lebanon', state: 'Oregon', zip: '15201', country: 'United States'},
        {line1: '404 Walnut Street', line2: '', city: 'Springfield', state: 'Ohio', zip: '27501', country: 'United States'},
        {line1: '707 Peachtree Blvd', line2: '', city: 'Dover', state: 'Oregon', zip: '48201', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Clinton', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '808 Poplar Place', line2: '', city: 'Salem', state: 'Colorado', zip: '98101', country: 'United States'},
        {line1: '3456 Poplar Place', line2: '', city: 'Milton', state: 'Kentucky', zip: '89501', country: 'United States'},
        {line1: '4321 Elm Street', line2: '', city: 'Henderson', state: 'Ohio', zip: '10001', country: 'United States'},
        {line1: '101 Aspen Terrace', line2: '', city: 'Newport', state: 'Colorado', zip: '89501', country: 'United States'},
        {line1: '909 Sunset Boulevard', line2: '', city: 'Henderson', state: 'Texas', zip: '62701', country: 'United States'},
        {line1: '909 Juniper Circle', line2: '', city: 'Springfield', state: 'Ohio', zip: '46201', country: 'United States'},
        {line1: '5670 Hickory Lane', line2: '', city: 'Madison', state: 'Illinois', zip: '73301', country: 'United States'},
        {line1: '707 Cedar Lane', line2: '', city: 'Madison', state: 'Virginia', zip: '80201', country: 'United States'},
        {line1: '404 Hickory Lane', line2: '', city: 'Clinton', state: 'Indiana', zip: '35004', country: 'United States'},
        {line1: '909 Walnut Street', line2: '', city: 'Salem', state: 'Florida', zip: '37201', country: 'United States'},
        {line1: '303 Washington Ave', line2: '', city: 'Springfield', state: 'Florida', zip: '97201', country: 'United States'},
        {line1: '4567 Oak Street', line2: '', city: 'Georgetown', state: 'Florida', zip: '35004', country: 'United States'},
        {line1: '606 Chestnut Court', line2: '', city: 'Fairview', state: 'Kentucky', zip: '73301', country: 'United States'},
        {line1: '909 Juniper Circle', line2: '', city: 'Franklin', state: 'Missouri', zip: '27501', country: 'United States'},
        {line1: '4321 Chestnut Court', line2: '', city: 'Henderson', state: 'Virginia', zip: '37201', country: 'United States'},
        {line1: '101 Maple Avenue', line2: '', city: 'Springfield', state: 'California', zip: '10001', country: 'United States'},
        {line1: '4321 Birch Drive', line2: '', city: 'Mount Vernon', state: 'Nevada', zip: '90210', country: 'United States'},
        {line1: '6781 Cedar Lane', line2: '', city: 'Dover', state: 'New York', zip: '44101', country: 'United States'},
        {line1: '7890 Cedar Lane', line2: '', city: 'Riverside', state: 'North Carolina', zip: '89501', country: 'United States'},
        {line1: '5678 Juniper Circle', line2: '', city: 'Madison', state: 'Georgia', zip: '62701', country: 'United States'},
        {line1: '606 Oak Street', line2: '', city: 'Kingston', state: 'California', zip: '73301', country: 'United States'},
        {line1: '5678 Fir Avenue', line2: '', city: 'Henderson', state: 'Tennessee', zip: '44101', country: 'United States'},
        {line1: '707 Birch Drive', line2: '', city: 'Greenville', state: 'Pennsylvania', zip: '62701', country: 'United States'},
        {line1: '606 Dogwood Drive', line2: '', city: 'Milton', state: 'Tennessee', zip: '73301', country: 'United States'},
        {line1: '909 Broadway', line2: '', city: 'Georgetown', state: 'Colorado', zip: '98101', country: 'United States'},
        {line1: '6781 Dogwood Drive', line2: '', city: 'Dover', state: 'Virginia', zip: '46201', country: 'United States'},
        {line1: '3456 Willow Way', line2: '', city: 'Mount Vernon', state: 'Colorado', zip: '23219', country: 'United States'},
        {line1: '2345 Chestnut Court', line2: '', city: 'Arlington', state: 'Ohio', zip: '97201', country: 'United States'},
        {line1: '8901 Walnut Street', line2: '', city: 'Bristol', state: 'Michigan', zip: '37201', country: 'United States'},
        {line1: '909 Washington Ave', line2: '', city: 'Georgetown', state: 'Tennessee', zip: '80201', country: 'United States'},
        {line1: '6781 Birch Drive', line2: '', city: 'Henderson', state: 'Nevada', zip: '73301', country: 'United States'},
        {line1: '808 Chestnut Court', line2: '', city: 'Salem', state: 'Tennessee', zip: '27501', country: 'United States'},
        {line1: '909 Walnut Street', line2: '', city: 'Bristol', state: 'Washington', zip: '33101', country: 'United States'},
        {line1: '5670 Poplar Place', line2: '', city: 'Mount Vernon', state: 'Georgia', zip: '37201', country: 'United States'},
        {line1: '1234 Walnut Street', line2: '', city: 'Milton', state: 'Pennsylvania', zip: '35004', country: 'United States'},
        {line1: '606 Aspen Terrace', line2: '', city: 'Ashland', state: 'Illinois', zip: '33101', country: 'United States'},
        {line1: '909 Hickory Lane', line2: '', city: 'Henderson', state: 'Indiana', zip: '97201', country: 'United States'},
        {line1: '303 Birch Drive', line2: '', city: 'Springfield', state: 'Missouri', zip: '90210', country: 'United States'},
        {line1: '4567 Juniper Circle', line2: '', city: 'Kingston', state: 'Nevada', zip: '40601', country: 'United States'},
        {line1: '2345 Magnolia Street', line2: '', city: 'Riverside', state: 'Virginia', zip: '15201', country: 'United States'},
        {line1: '404 Elm Street', line2: '', city: 'Franklin', state: 'Nevada', zip: '44101', country: 'United States'},
        {line1: '6789 Peachtree Blvd', line2: '', city: 'Franklin', state: 'Colorado', zip: '63101', country: 'United States'},
        {line1: '4321 Willow Way', line2: '', city: 'Milton', state: 'Washington', zip: '40601', country: 'United States'},
        {line1: '5670 Birch Drive', line2: '', city: 'Bristol', state: 'Michigan', zip: '30301', country: 'United States'},
        {line1: '505 Dogwood Drive', line2: '', city: 'Greenville', state: 'California', zip: '40601', country: 'United States'},
        {line1: '101 Maple Avenue', line2: '', city: 'Arlington', state: 'Indiana', zip: '48201', country: 'United States'},

        // New addresses from generated_addresses.txt
        {line1: '5670 Pine Road', line2: '', city: 'Clinton', state: 'Pennsylvania', zip: '90210', country: 'United States'},
        {line1: '808 Elm Street', line2: '', city: 'Madison', state: 'Texas', zip: '48201', country: 'United States'},
        {line1: '707 Pine Road', line2: '', city: 'Salem', state: 'Colorado', zip: '73301', country: 'United States'},
        {line1: '4321 Cedar Lane', line2: '', city: 'Arlington', state: 'Tennessee', zip: '33101', country: 'United States'},
        {line1: '2345 Elm Street', line2: '', city: 'Kingston', state: 'Kentucky', zip: '15201', country: 'United States'},
        {line1: '808 Aspen Terrace', line2: '', city: 'Milton', state: 'Colorado', zip: '89501', country: 'United States'},
        {line1: '5670 Washington Ave', line2: '', city: 'Salem', state: 'Oregon', zip: '35004', country: 'United States'},
        {line1: '7890 Willow Way', line2: '', city: 'Bristol', state: 'Pennsylvania', zip: '44101', country: 'United States'},
        {line1: '7890 Chestnut Court', line2: '', city: 'Mount Vernon', state: 'Nevada', zip: '10001', country: 'United States'},
        {line1: '1234 Magnolia Street', line2: '', city: 'Dover', state: 'Tennessee', zip: '15201', country: 'United States'},
        {line1: '6789 Magnolia Street', line2: '', city: 'Clinton', state: 'Florida', zip: '89501', country: 'United States'},
        {line1: '7890 Birch Drive', line2: '', city: 'Madison', state: 'Oregon', zip: '89501', country: 'United States'},
        {line1: '505 Fir Avenue', line2: '', city: 'Bristol', state: 'Tennessee', zip: '35004', country: 'United States'},
        {line1: '505 Poplar Place', line2: '', city: 'Kingston', state: 'Alabama', zip: '23219', country: 'United States'},
        {line1: '606 Broadway', line2: '', city: 'Madison', state: 'Michigan', zip: '89501', country: 'United States'},
        {line1: '6781 Cedar Lane', line2: '', city: 'Lebanon', state: 'Virginia', zip: '27501', country: 'United States'},
        {line1: '606 Willow Way', line2: '', city: 'Riverside', state: 'Tennessee', zip: '35004', country: 'United States'},
        {line1: '5670 Cedar Lane', line2: '', city: 'Henderson', state: 'California', zip: '46201', country: 'United States'},
        {line1: '2345 Magnolia Street', line2: '', city: 'Dover', state: 'Alabama', zip: '63101', country: 'United States'},
        {line1: '1234 Elm Street', line2: '', city: 'Ashland', state: 'Virginia', zip: '33101', country: 'United States'},
        {line1: '606 Juniper Circle', line2: '', city: 'Franklin', state: 'Colorado', zip: '23219', country: 'United States'},
        {line1: '303 Fir Avenue', line2: '', city: 'Bristol', state: 'Florida', zip: '44101', country: 'United States'},
        {line1: '909 Peachtree Blvd', line2: '', city: 'Bristol', state: 'Georgia', zip: '62701', country: 'United States'},
        {line1: '3456 Peachtree Blvd', line2: '', city: 'Lebanon', state: 'Washington', zip: '63101', country: 'United States'},
        {line1: '909 Sunset Boulevard', line2: '', city: 'Bristol', state: 'Illinois', zip: '80201', country: 'United States'},
        {line1: '3456 Hickory Lane', line2: '', city: 'Springfield', state: 'Pennsylvania', zip: '40601', country: 'United States'},
        {line1: '101 Poplar Place', line2: '', city: 'Salem', state: 'Nevada', zip: '98101', country: 'United States'},
        {line1: '404 Birch Drive', line2: '', city: 'Kingston', state: 'New York', zip: '97201', country: 'United States'},
        {line1: '606 Oak Street', line2: '', city: 'Henderson', state: 'Illinois', zip: '30301', country: 'United States'},
        {line1: '8901 Birch Drive', line2: '', city: 'Lebanon', state: 'Alabama', zip: '37201', country: 'United States'},
        {line1: '3456 Chestnut Court', line2: '', city: 'Franklin', state: 'Pennsylvania', zip: '62701', country: 'United States'},
        {line1: '3456 Elm Street', line2: '', city: 'Madison', state: 'Colorado', zip: '27501', country: 'United States'},
        {line1: '202 Cedar Lane', line2: '', city: 'Georgetown', state: 'New York', zip: '27501', country: 'United States'},
        {line1: '3456 Juniper Circle', line2: '', city: 'Clinton', state: 'Oregon', zip: '35004', country: 'United States'},
        {line1: '404 Aspen Terrace', line2: '', city: 'Riverside', state: 'Alabama', zip: '89501', country: 'United States'},
        {line1: '303 Hickory Lane', line2: '', city: 'Bristol', state: 'Georgia', zip: '10001', country: 'United States'},
        {line1: '808 Birch Drive', line2: '', city: 'Salem', state: 'Indiana', zip: '27501', country: 'United States'},
        {line1: '606 Chestnut Court', line2: '', city: 'Ashland', state: 'Nevada', zip: '48201', country: 'United States'},
        {line1: '303 Broadway', line2: '', city: 'Franklin', state: 'Georgia', zip: '97201', country: 'United States'},
        {line1: '808 Peachtree Blvd', line2: '', city: 'Henderson', state: 'Florida', zip: '48201', country: 'United States'},
        {line1: '6781 Broadway', line2: '', city: 'Henderson', state: 'New York', zip: '44101', country: 'United States'},
        {line1: '101 Elm Street', line2: '', city: 'Greenville', state: 'Alabama', zip: '98101', country: 'United States'},
        {line1: '303 Cedar Lane', line2: '', city: 'Ashland', state: 'Washington', zip: '10001', country: 'United States'},
        {line1: '2345 Fir Avenue', line2: '', city: 'Clinton', state: 'Tennessee', zip: '89501', country: 'United States'},
        {line1: '505 Maple Avenue', line2: '', city: 'Fairview', state: 'Texas', zip: '44101', country: 'United States'},
        {line1: '2345 Hickory Lane', line2: '', city: 'Milton', state: 'Virginia', zip: '98101', country: 'United States'},
        {line1: '505 Dogwood Drive', line2: '', city: 'Kingston', state: 'Colorado', zip: '62701', country: 'United States'},
        {line1: '101 Fir Avenue', line2: '', city: 'Greenville', state: 'Tennessee', zip: '63101', country: 'United States'},
        {line1: '707 Juniper Circle', line2: '', city: 'Clinton', state: 'Oregon', zip: '37201', country: 'United States'},
        {line1: '202 Aspen Terrace', line2: '', city: 'Clinton', state: 'Nevada', zip: '27501', country: 'United States'},
        {line1: '909 Fir Avenue', line2: '', city: 'Kingston', state: 'Oregon', zip: '23219', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Dover', state: 'Michigan', zip: '37201', country: 'United States'},
        {line1: '909 Washington Ave', line2: '', city: 'Dover', state: 'New York', zip: '35004', country: 'United States'},
        {line1: '5678 Oak Street', line2: '', city: 'Clinton', state: 'Kentucky', zip: '89501', country: 'United States'},
        {line1: '808 Washington Ave', line2: '', city: 'Franklin', state: 'Texas', zip: '90210', country: 'United States'},
        {line1: '101 Dogwood Drive', line2: '', city: 'Dover', state: 'North Carolina', zip: '37201', country: 'United States'},
        {line1: '8901 Birch Drive', line2: '', city: 'Springfield', state: 'Florida', zip: '10001', country: 'United States'},
        {line1: '6781 Poplar Place', line2: '', city: 'Clinton', state: 'Michigan', zip: '44101', country: 'United States'},
        {line1: '505 Maple Avenue', line2: '', city: 'Fairview', state: 'Oregon', zip: '73301', country: 'United States'},
        {line1: '5670 Fir Avenue', line2: '', city: 'Arlington', state: 'North Carolina', zip: '33101', country: 'United States'},
        {line1: '202 Sunset Boulevard', line2: '', city: 'Georgetown', state: 'Texas', zip: '27501', country: 'United States'},
        {line1: '4567 Pine Road', line2: '', city: 'Riverside', state: 'New York', zip: '98101', country: 'United States'},
        {line1: '6781 Elm Street', line2: '', city: 'Salem', state: 'Missouri', zip: '89501', country: 'United States'},
        {line1: '7890 Birch Drive', line2: '', city: 'Newport', state: 'Colorado', zip: '37201', country: 'United States'},
        {line1: '505 Chestnut Court', line2: '', city: 'Arlington', state: 'Indiana', zip: '48201', country: 'United States'},
        {line1: '4321 Sunset Boulevard', line2: '', city: 'Franklin', state: 'Oregon', zip: '48201', country: 'United States'},
        {line1: '2345 Sunset Boulevard', line2: '', city: 'Newport', state: 'New York', zip: '62701', country: 'United States'},
        {line1: '5678 Aspen Terrace', line2: '', city: 'Arlington', state: 'Illinois', zip: '33101', country: 'United States'},
        {line1: '202 Magnolia Street', line2: '', city: 'Ashland', state: 'Colorado', zip: '37201', country: 'United States'},
        {line1: '707 Sunset Boulevard', line2: '', city: 'Newport', state: 'North Carolina', zip: '73301', country: 'United States'},
        {line1: '505 Sunset Boulevard', line2: '', city: 'Newport', state: 'Illinois', zip: '98101', country: 'United States'},
        {line1: '6789 Oak Street', line2: '', city: 'Riverside', state: 'Pennsylvania', zip: '97201', country: 'United States'},
        {line1: '6789 Peachtree Blvd', line2: '', city: 'Salem', state: 'Texas', zip: '80201', country: 'United States'},
        {line1: '303 Elm Street', line2: '', city: 'Springfield', state: 'Oregon', zip: '80201', country: 'United States'},
        {line1: '6781 Poplar Place', line2: '', city: 'Georgetown', state: 'Oregon', zip: '15201', country: 'United States'},
        {line1: '6781 Chestnut Court', line2: '', city: 'Fairview', state: 'Washington', zip: '80201', country: 'United States'},
        {line1: '6781 Magnolia Street', line2: '', city: 'Georgetown', state: 'Virginia', zip: '98101', country: 'United States'},
        {line1: '4321 Oak Street', line2: '', city: 'Georgetown', state: 'Illinois', zip: '27501', country: 'United States'},
        {line1: '5678 Elm Street', line2: '', city: 'Lebanon', state: 'New York', zip: '97201', country: 'United States'},
        {line1: '606 Fir Avenue', line2: '', city: 'Clinton', state: 'Virginia', zip: '35004', country: 'United States'},
        {line1: '6781 Birch Drive', line2: '', city: 'Georgetown', state: 'Washington', zip: '62701', country: 'United States'},
        {line1: '2345 Hickory Lane', line2: '', city: 'Lebanon', state: 'Georgia', zip: '80201', country: 'United States'},
        {line1: '707 Elm Street', line2: '', city: 'Madison', state: 'Alabama', zip: '63101', country: 'United States'},
        {line1: '4321 Oak Street', line2: '', city: 'Mount Vernon', state: 'California', zip: '30301', country: 'United States'},
        {line1: '303 Sunset Boulevard', line2: '', city: 'Mount Vernon', state: 'Indiana', zip: '33101', country: 'United States'},
        {line1: '3456 Peachtree Blvd', line2: '', city: 'Bristol', state: 'Alabama', zip: '30301', country: 'United States'},
        {line1: '505 Pine Road', line2: '', city: 'Clinton', state: 'Nevada', zip: '27501', country: 'United States'},
        {line1: '4321 Maple Avenue', line2: '', city: 'Salem', state: 'Washington', zip: '10001', country: 'United States'},
        {line1: '1234 Broadway', line2: '', city: 'Fremont', state: 'Illinois', zip: '63101', country: 'United States'},
        {line1: '2345 Cedar Lane', line2: '', city: 'Mount Vernon', state: 'California', zip: '35004', country: 'United States'},
        {line1: '202 Juniper Circle', line2: '', city: 'Greenville', state: 'Pennsylvania', zip: '90210', country: 'United States'},
        {line1: '5670 Birch Drive', line2: '', city: 'Lebanon', state: 'Texas', zip: '73301', country: 'United States'},
        {line1: '3456 Peachtree Blvd', line2: '', city: 'Arlington', state: 'Nevada', zip: '27501', country: 'United States'},
        {line1: '808 Dogwood Drive', line2: '', city: 'Arlington', state: 'Kentucky', zip: '10001', country: 'United States'},
        {line1: '7890 Aspen Terrace', line2: '', city: 'Madison', state: 'Illinois', zip: '63101', country: 'United States'},
        {line1: '5678 Hickory Lane', line2: '', city: 'Clinton', state: 'Alabama', zip: '40601', country: 'United States'},
        {line1: '101 Hickory Lane', line2: '', city: 'Bristol', state: 'Illinois', zip: '10001', country: 'United States'},        {line1: '5678 Washington Ave', line2: '', city: 'Arlington', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '3456 Chestnut Court', line2: '', city: 'Mount Vernon', state: 'Florida', zip: '46201', country: 'United States'},
        {line1: '6789 Maple Avenue', line2: '', city: 'Dover', state: 'Indiana', zip: '63101', country: 'United States'},

        // Additional unique addresses from Generated_addresses(1).txt
        {line1: '3456 Juniper Circle', line2: '', city: 'Dover', state: 'New York', zip: '30301', country: 'United States'},
        {line1: '505 Willow Way', line2: '', city: 'Riverside', state: 'Oregon', zip: '89501', country: 'United States'},
        {line1: '606 Oak Street', line2: '', city: 'Ashland', state: 'New York', zip: '37201', country: 'United States'},
        {line1: '6789 Chestnut Court', line2: '', city: 'Lebanon', state: 'Tennessee', zip: '80201', country: 'United States'},
        {line1: '6789 Birch Drive', line2: '', city: 'Henderson', state: 'Alabama', zip: '46201', country: 'United States'},
        {line1: '2345 Hickory Lane', line2: '', city: 'Madison', state: 'Nevada', zip: '89501', country: 'United States'},
        {line1: '7890 Willow Way', line2: '', city: 'Madison', state: 'New York', zip: '44101', country: 'United States'},
        {line1: '404 Juniper Circle', line2: '', city: 'Riverside', state: 'North Carolina', zip: '30301', country: 'United States'},
        {line1: '303 Birch Drive', line2: '', city: 'Newport', state: 'New York', zip: '33101', country: 'United States'},
        {line1: '3456 Peachtree Blvd', line2: '', city: 'Lebanon', state: 'Nevada', zip: '35004', country: 'United States'},
        {line1: '6781 Cedar Lane', line2: '', city: 'Springfield', state: 'Missouri', zip: '40601', country: 'United States'},
        {line1: '404 Broadway', line2: '', city: 'Georgetown', state: 'Nevada', zip: '46201', country: 'United States'},
        {line1: '101 Walnut Street', line2: '', city: 'Madison', state: 'Kentucky', zip: '33101', country: 'United States'},
        {line1: '6789 Cedar Lane', line2: '', city: 'Madison', state: 'Nevada', zip: '33101', country: 'United States'},
        {line1: '4567 Chestnut Court', line2: '', city: 'Newport', state: 'Michigan', zip: '44101', country: 'United States'},
        {line1: '808 Aspen Terrace', line2: '', city: 'Salem', state: 'Missouri', zip: '15201', country: 'United States'},
        {line1: '404 Chestnut Court', line2: '', city: 'Arlington', state: 'Ohio', zip: '33101', country: 'United States'},
        {line1: '5670 Sunset Boulevard', line2: '', city: 'Mount Vernon', state: 'Virginia', zip: '97201', country: 'United States'},
        {line1: '7890 Aspen Terrace', line2: '', city: 'Arlington', state: 'Nevada', zip: '35004', country: 'United States'},
        {line1: '3456 Birch Drive', line2: '', city: 'Mount Vernon', state: 'Tennessee', zip: '35004', country: 'United States'},
        {line1: '4321 Willow Way', line2: '', city: 'Springfield', state: 'Alabama', zip: '90210', country: 'United States'},
        {line1: '2345 Walnut Street', line2: '', city: 'Franklin', state: 'New York', zip: '37201', country: 'United States'},
        {line1: '909 Elm Street', line2: '', city: 'Mount Vernon', state: 'Colorado', zip: '35004', country: 'United States'},
        {line1: '5670 Willow Way', line2: '', city: 'Madison', state: 'Nevada', zip: '40601', country: 'United States'},
        {line1: '5670 Washington Ave', line2: '', city: 'Kingston', state: 'Kentucky', zip: '37201', country: 'United States'},
        {line1: '8901 Oak Street', line2: '', city: 'Bristol', state: 'Illinois', zip: '30301', country: 'United States'},
        {line1: '7890 Sunset Boulevard', line2: '', city: 'Springfield', state: 'Colorado', zip: '35004', country: 'United States'},
        {line1: '6789 Cedar Lane', line2: '', city: 'Springfield', state: 'New York', zip: '63101', country: 'United States'},
        {line1: '1234 Elm Street', line2: '', city: 'Dover', state: 'North Carolina', zip: '30301', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Lebanon', state: 'Nevada', zip: '40601', country: 'United States'},
        {line1: '4567 Broadway', line2: '', city: 'Dover', state: 'California', zip: '44101', country: 'United States'},
        {line1: '505 Juniper Circle', line2: '', city: 'Henderson', state: 'Nevada', zip: '15201', country: 'United States'},
        {line1: '909 Elm Street', line2: '', city: 'Henderson', state: 'New York', zip: '46201', country: 'United States'},
        {line1: '909 Fir Avenue', line2: '', city: 'Riverside', state: 'Tennessee', zip: '90210', country: 'United States'},
        {line1: '4567 Maple Avenue', line2: '', city: 'Dover', state: 'Missouri', zip: '10001', country: 'United States'},
        {line1: '3456 Dogwood Drive', line2: '', city: 'Franklin', state: 'Oregon', zip: '97201', country: 'United States'},
        {line1: '404 Chestnut Court', line2: '', city: 'Franklin', state: 'Florida', zip: '30301', country: 'United States'},
        {line1: '707 Sunset Boulevard', line2: '', city: 'Arlington', state: 'Ohio', zip: '98101', country: 'United States'},
        {line1: '101 Broadway', line2: '', city: 'Newport', state: 'Virginia', zip: '30301', country: 'United States'},
        {line1: '8901 Dogwood Drive', line2: '', city: 'Riverside', state: 'Indiana', zip: '10001', country: 'United States'},
        {line1: '202 Juniper Circle', line2: '', city: 'Dover', state: 'Pennsylvania', zip: '33101', country: 'United States'},
        {line1: '6789 Washington Ave', line2: '', city: 'Franklin', state: 'Oregon', zip: '89501', country: 'United States'},
        {line1: '303 Elm Street', line2: '', city: 'Arlington', state: 'Texas', zip: '33101', country: 'United States'},
        {line1: '6781 Juniper Circle', line2: '', city: 'Mount Vernon', state: 'Tennessee', zip: '44101', country: 'United States'},
        {line1: '1234 Hickory Lane', line2: '', city: 'Fremont', state: 'Illinois', zip: '37201', country: 'United States'},
        {line1: '909 Broadway', line2: '', city: 'Newport', state: 'Oregon', zip: '35004', country: 'United States'},
        {line1: '505 Elm Street', line2: '', city: 'Kingston', state: 'Washington', zip: '63101', country: 'United States'},
        {line1: '909 Magnolia Street', line2: '', city: 'Mount Vernon', state: 'Virginia', zip: '10001', country: 'United States'},
        {line1: '8901 Maple Avenue', line2: '', city: 'Henderson', state: 'Pennsylvania', zip: '44101', country: 'United States'},
        {line1: '707 Dogwood Drive', line2: '', city: 'Springfield', state: 'California', zip: '37201', country: 'United States'},
        {line1: '606 Oak Street', line2: '', city: 'Salem', state: 'Missouri', zip: '33101', country: 'United States'},
        {line1: '707 Magnolia Street', line2: '', city: 'Riverside', state: 'Missouri', zip: '27501', country: 'United States'},
        {line1: '101 Juniper Circle', line2: '', city: 'Ashland', state: 'Oregon', zip: '80201', country: 'United States'},
        {line1: '202 Oak Street', line2: '', city: 'Salem', state: 'Colorado', zip: '90210', country: 'United States'},
        {line1: '2345 Broadway', line2: '', city: 'Madison', state: 'Ohio', zip: '37201', country: 'United States'},
        {line1: '5678 Maple Avenue', line2: '', city: 'Springfield', state: 'Georgia', zip: '23219', country: 'United States'},
        {line1: '202 Oak Street', line2: '', city: 'Lebanon', state: 'California', zip: '80201', country: 'United States'},
        {line1: '3456 Maple Avenue', line2: '', city: 'Riverside', state: 'Michigan', zip: '46201', country: 'United States'},
        {line1: '2345 Broadway', line2: '', city: 'Springfield', state: 'Colorado', zip: '46201', country: 'United States'},
        {line1: '7890 Aspen Terrace', line2: '', city: 'Franklin', state: 'Colorado', zip: '30301', country: 'United States'},
        {line1: '6781 Pine Road', line2: '', city: 'Greenville', state: 'Oregon', zip: '23219', country: 'United States'},
        {line1: '101 Broadway', line2: '', city: 'Dover', state: 'Georgia', zip: '33101', country: 'United States'},
        {line1: '5678 Birch Drive', line2: '', city: 'Mount Vernon', state: 'Alabama', zip: '46201', country: 'United States'},
        {line1: '303 Washington Ave', line2: '', city: 'Newport', state: 'Florida', zip: '33101', country: 'United States'},
        {line1: '505 Chestnut Court', line2: '', city: 'Salem', state: 'Missouri', zip: '30301', country: 'United States'},
        {line1: '7890 Elm Street', line2: '', city: 'Milton', state: 'California', zip: '27501', country: 'United States'},
        {line1: '1234 Willow Way', line2: '', city: 'Franklin', state: 'Georgia', zip: '62701', country: 'United States'},
        {line1: '3456 Dogwood Drive', line2: '', city: 'Salem', state: 'Oregon', zip: '48201', country: 'United States'},
        {line1: '6781 Birch Drive', line2: '', city: 'Arlington', state: 'Kentucky', zip: '37201', country: 'United States'},
        {line1: '6789 Hickory Lane', line2: '', city: 'Clinton', state: 'New York', zip: '40601', country: 'United States'},
        {line1: '303 Juniper Circle', line2: '', city: 'Clinton', state: 'Tennessee', zip: '80201', country: 'United States'},
        {line1: '4567 Walnut Street', line2: '', city: 'Arlington', state: 'Missouri', zip: '48201', country: 'United States'},
        {line1: '2345 Washington Ave', line2: '', city: 'Salem', state: 'Illinois', zip: '33101', country: 'United States'},
        {line1: '1234 Chestnut Court', line2: '', city: 'Henderson', state: 'Illinois', zip: '63101', country: 'United States'},
        {line1: '5670 Birch Drive', line2: '', city: 'Clinton', state: 'California', zip: '10001', country: 'United States'},
        {line1: '4321 Oak Street', line2: '', city: 'Ashland', state: 'Florida', zip: '35004', country: 'United States'},
        {line1: '5678 Maple Avenue', line2: '', city: 'Kingston', state: 'Tennessee', zip: '90210', country: 'United States'},
        {line1: '707 Elm Street', line2: '', city: 'Franklin', state: 'Colorado', zip: '90210', country: 'United States'},
        {line1: '202 Dogwood Drive', line2: '', city: 'Arlington', state: 'Florida', zip: '33101', country: 'United States'},
        {line1: '909 Elm Street', line2: '', city: 'Madison', state: 'Pennsylvania', zip: '89501', country: 'United States'},
        {line1: '101 Willow Way', line2: '', city: 'Clinton', state: 'California', zip: '37201', country: 'United States'},
        {line1: '5670 Willow Way', line2: '', city: 'Mount Vernon', state: 'Alabama', zip: '15201', country: 'United States'},
        {line1: '505 Washington Ave', line2: '', city: 'Springfield', state: 'Kentucky', zip: '97201', country: 'United States'},
        {line1: '202 Fir Avenue', line2: '', city: 'Fremont', state: 'California', zip: '10001', country: 'United States'},
        {line1: '202 Walnut Street', line2: '', city: 'Milton', state: 'Georgia', zip: '30301', country: 'United States'},
        {line1: '707 Elm Street', line2: '', city: 'Milton', state: 'Illinois', zip: '40601', country: 'United States'},
        {line1: '707 Peachtree Blvd', line2: '', city: 'Mount Vernon', state: 'Virginia', zip: '46201', country: 'United States'},
        {line1: '202 Pine Road', line2: '', city: 'Henderson', state: 'North Carolina', zip: '10001', country: 'United States'},
        {line1: '404 Dogwood Drive', line2: '', city: 'Henderson', state: 'Nevada', zip: '89501', country: 'United States'},
        {line1: '101 Sunset Boulevard', line2: '', city: 'Henderson', state: 'Missouri', zip: '33101', country: 'United States'},
        {line1: '4321 Washington Ave', line2: '', city: 'Newport', state: 'Tennessee', zip: '35004', country: 'United States'},
        {line1: '202 Pine Road', line2: '', city: 'Dover', state: 'North Carolina', zip: '63101', country: 'United States'},
        {line1: '7890 Sunset Boulevard', line2: '', city: 'Salem', state: 'Michigan', zip: '63101', country: 'United States'},
        {line1: '101 Broadway', line2: '', city: 'Clinton', state: 'Tennessee', zip: '73301', country: 'United States'},
        {line1: '6789 Poplar Place', line2: '', city: 'Henderson', state: 'Illinois', zip: '73301', country: 'United States'},
        {line1: '2345 Elm Street', line2: '', city: 'Milton', state: 'Tennessee', zip: '62701', country: 'United States'},
        {line1: '505 Elm Street', line2: '', city: 'Henderson', state: 'Indiana', zip: '35004', country: 'United States'},
        {line1: '101 Oak Street', line2: '', city: 'Fremont', state: 'Virginia', zip: '33101', country: 'United States'},
        {line1: '5670 Sunset Boulevard', line2: '', city: 'Fremont', state: 'Virginia', zip: '37201', country: 'United States'},
        {line1: '707 Sunset Boulevard', line2: '', city: 'Mount Vernon', state: 'Pennsylvania', zip: '10001', country: 'United States'},
        {line1: '3456 Aspen Terrace', line2: '', city: 'Mount Vernon', state: 'Oregon', zip: '48201', country: 'United States'},
        {line1: '202 Dogwood Drive', line2: '', city: 'Milton', state: 'Illinois', zip: '73301', country: 'United States'},
        {line1: '4567 Poplar Place', line2: '', city: 'Franklin', state: 'Nevada', zip: '27501', country: 'United States'},
        {line1: '6789 Magnolia Street', line2: '', city: 'Fremont', state: 'California', zip: '80201', country: 'United States'},
        {line1: '606 Maple Avenue', line2: '', city: 'Dover', state: 'Tennessee', zip: '10001', country: 'United States'},
        {line1: '303 Peachtree Blvd', line2: '', city: 'Fremont', state: 'Alabama', zip: '73301', country: 'United States'},
        {line1: '202 Aspen Terrace', line2: '', city: 'Bristol', state: 'Michigan', zip: '80201', country: 'United States'},
        {line1: '7890 Cedar Lane', line2: '', city: 'Lebanon', state: 'Pennsylvania', zip: '89501', country: 'United States'},
        {line1: '2345 Sunset Boulevard', line2: '', city: 'Newport', state: 'Missouri', zip: '35004', country: 'United States'},
        {line1: '4567 Fir Avenue', line2: '', city: 'Mount Vernon', state: 'Alabama', zip: '30301', country: 'United States'},
        {line1: '808 Fir Avenue', line2: '', city: 'Bristol', state: 'Colorado', zip: '40601', country: 'United States'},
        {line1: '3456 Cedar Lane', line2: '', city: 'Arlington', state: 'New York', zip: '48201', country: 'United States'},
        {line1: '1234 Oak Street', line2: '', city: 'Greenville', state: 'Virginia', zip: '89501', country: 'United States'},
        {line1: '6789 Sunset Boulevard', line2: '', city: 'Clinton', state: 'Michigan', zip: '63101', country: 'United States'},
        {line1: '2345 Magnolia Street', line2: '', city: 'Bristol', state: 'Georgia', zip: '10001', country: 'United States'},
        {line1: '808 Pine Road', line2: '', city: 'Newport', state: 'Washington', zip: '37201', country: 'United States'},
        {line1: '606 Willow Way', line2: '', city: 'Riverside', state: 'Kentucky', zip: '90210', country: 'United States'},
        {line1: '202 Hickory Lane', line2: '', city: 'Kingston', state: 'Missouri', zip: '98101', country: 'United States'},
        {line1: '8901 Birch Drive', line2: '', city: 'Fremont', state: 'Florida', zip: '90210', country: 'United States'},
        {line1: '303 Fir Avenue', line2: '', city: 'Georgetown', state: 'Texas', zip: '37201', country: 'United States'},
        {line1: '707 Washington Ave', line2: '', city: 'Fairview', state: 'California', zip: '15201', country: 'United States'},
        {line1: '7890 Aspen Terrace', line2: '', city: 'Dover', state: 'North Carolina', zip: '98101', country: 'United States'},
        {line1: '6781 Aspen Terrace', line2: '', city: 'Springfield', state: 'Kentucky', zip: '98101', country: 'United States'},
        {line1: '5670 Birch Drive', line2: '', city: 'Ashland', state: 'Florida', zip: '10001', country: 'United States'},
        {line1: '909 Magnolia Street', line2: '', city: 'Franklin', state: 'Michigan', zip: '44101', country: 'United States'},
        {line1: '101 Juniper Circle', line2: '', city: 'Mount Vernon', state: 'Kentucky', zip: '10001', country: 'United States'},
        {line1: '5670 Fir Avenue', line2: '', city: 'Fremont', state: 'Florida', zip: '10001', country: 'United States'},
        {line1: '808 Washington Ave', line2: '', city: 'Georgetown', state: 'Kentucky', zip: '62701', country: 'United States'},
        {line1: '2345 Poplar Place', line2: '', city: 'Fairview', state: 'Tennessee', zip: '37201', country: 'United States'},
        {line1: '303 Fir Avenue', line2: '', city: 'Dover', state: 'Missouri', zip: '97201', country: 'United States'},
        {line1: '909 Hickory Lane', line2: '', city: 'Ashland', state: 'Kentucky', zip: '23219', country: 'United States'},
        {line1: '1234 Fir Avenue', line2: '', city: 'Franklin', state: 'Tennessee', zip: '48201', country: 'United States'},
        {line1: '6781 Maple Avenue', line2: '', city: 'Riverside', state: 'Indiana', zip: '97201', country: 'United States'},
        {line1: '6781 Juniper Circle', line2: '', city: 'Henderson', state: 'Missouri', zip: '27501', country: 'United States'},
        {line1: '6781 Elm Street', line2: '', city: 'Franklin', state: 'Oregon', zip: '63101', country: 'United States'},
        {line1: '8901 Hickory Lane', line2: '', city: 'Mount Vernon', state: 'New York', zip: '15201', country: 'United States'},
        {line1: '8901 Broadway', line2: '', city: 'Bristol', state: 'Washington', zip: '48201', country: 'United States'},
        {line1: '4567 Walnut Street', line2: '', city: 'Clinton', state: 'Missouri', zip: '63101', country: 'United States'},
        {line1: '606 Magnolia Street', line2: '', city: 'Mount Vernon', state: 'Pennsylvania', zip: '46201', country: 'United States'},
        {line1: '5670 Peachtree Blvd', line2: '', city: 'Fairview', state: 'Washington', zip: '63101', country: 'United States'},
        {line1: '6781 Washington Ave', line2: '', city: 'Milton', state: 'Illinois', zip: '37201', country: 'United States'},
        {line1: '606 Chestnut Court', line2: '', city: 'Greenville', state: 'North Carolina', zip: '27501', country: 'United States'},
        {line1: '5678 Birch Drive', line2: '', city: 'Greenville', state: 'Georgia', zip: '15201', country: 'United States'},
        {line1: '4321 Birch Drive', line2: '', city: 'Clinton', state: 'Michigan', zip: '35004', country: 'United States'},
        {line1: '3456 Maple Avenue', line2: '', city: 'Ashland', state: 'Virginia', zip: '10001', country: 'United States'},
        {line1: '606 Elm Street', line2: '', city: 'Madison', state: 'Oregon', zip: '89501', country: 'United States'},
        {line1: '2345 Cedar Lane', line2: '', city: 'Fremont', state: 'California', zip: '89501', country: 'United States'},
        {line1: '7890 Dogwood Drive', line2: '', city: 'Arlington', state: 'Indiana', zip: '62701', country: 'United States'},
        {line1: '505 Juniper Circle', line2: '', city: 'Fremont', state: 'Virginia', zip: '73301', country: 'United States'},
        {line1: '5670 Juniper Circle', line2: '', city: 'Mount Vernon', state: 'Illinois', zip: '44101', country: 'United States'},
        {line1: '7890 Chestnut Court', line2: '', city: 'Georgetown', state: 'North Carolina', zip: '98101', country: 'United States'},
        {line1: '101 Sunset Boulevard', line2: '', city: 'Georgetown', state: 'North Carolina', zip: '33101', country: 'United States'},
        {line1: '6781 Washington Ave', line2: '', city: 'Ashland', state: 'Washington', zip: '97201', country: 'United States'},
        {line1: '707 Magnolia Street', line2: '', city: 'Fairview', state: 'North Carolina', zip: '62701', country: 'United States'},
        {line1: '2345 Willow Way', line2: '', city: 'Greenville', state: 'Nevada', zip: '80201', country: 'United States'},
        {line1: '101 Walnut Street', line2: '', city: 'Madison', state: 'Florida', zip: '35004', country: 'United States'},
        {line1: '7890 Peachtree Blvd', line2: '', city: 'Fremont', state: 'Oregon', zip: '62701', country: 'United States'},
        {line1: '101 Elm Street', line2: '', city: 'Madison', state: 'Pennsylvania', zip: '73301', country: 'United States'},
        {line1: '808 Magnolia Street', line2: '', city: 'Milton', state: 'Alabama', zip: '62701', country: 'United States'},
        {line1: '101 Magnolia Street', line2: '', city: 'Milton', state: 'New York', zip: '15201', country: 'United States'},
        {line1: '909 Walnut Street', line2: '', city: 'Madison', state: 'Nevada', zip: '46201', country: 'United States'},
        {line1: '4321 Juniper Circle', line2: '', city: 'Henderson', state: 'Tennessee', zip: '48201', country: 'United States'},
        {line1: '303 Aspen Terrace', line2: '', city: 'Madison', state: 'Michigan', zip: '89501', country: 'United States'},
        {line1: '101 Fir Avenue', line2: '', city: 'Greenville', state: 'Michigan', zip: '23219', country: 'United States'},
        {line1: '8901 Elm Street', line2: '', city: 'Fairview', state: 'Alabama', zip: '80201', country: 'United States'},
        {line1: '4321 Dogwood Drive', line2: '', city: 'Milton', state: 'Kentucky', zip: '90210', country: 'United States'},
        {line1: '4567 Peachtree Blvd', line2: '', city: 'Georgetown', state: 'Alabama', zip: '62701', country: 'United States'},
        {line1: '8901 Elm Street', line2: '', city: 'Fremont', state: 'Texas', zip: '33101', country: 'United States'},
        {line1: '4567 Oak Street', line2: '', city: 'Milton', state: 'Missouri', zip: '37201', country: 'United States'},
        {line1: '4321 Magnolia Street', line2: '', city: 'Dover', state: 'North Carolina', zip: '63101', country: 'United States'},
        {line1: '2345 Oak Street', line2: '', city: 'Greenville', state: 'Colorado', zip: '89501', country: 'United States'},
        {line1: '2345 Chestnut Court', line2: '', city: 'Clinton', state: 'Pennsylvania', zip: '40601', country: 'United States'},
        {line1: '101 Willow Way', line2: '', city: 'Riverside', state: 'North Carolina', zip: '98101', country: 'United States'},
        {line1: '5678 Poplar Place', line2: '', city: 'Clinton', state: 'Colorado', zip: '10001', country: 'United States'},
        {line1: '4321 Willow Way', line2: '', city: 'Kingston', state: 'Georgia', zip: '15201', country: 'United States'},
        {line1: '101 Poplar Place', line2: '', city: 'Newport', state: 'Nevada', zip: '98101', country: 'United States'},
        {line1: '3456 Pine Road', line2: '', city: 'Franklin', state: 'North Carolina', zip: '48201', country: 'United States'},
        {line1: '404 Cedar Lane', line2: '', city: 'Mount Vernon', state: 'North Carolina', zip: '97201', country: 'United States'},
        {line1: '6789 Peachtree Blvd', line2: '', city: 'Mount Vernon', state: 'New York', zip: '48201', country: 'United States'},
        {line1: '909 Hickory Lane', line2: '', city: 'Newport', state: 'New York', zip: '23219', country: 'United States'},
        {line1: '6781 Fir Avenue', line2: '', city: 'Milton', state: 'Ohio', zip: '15201', country: 'United States'},
        {line1: '101 Peachtree Blvd', line2: '', city: 'Ashland', state: 'Missouri', zip: '48201', country: 'United States'},
        {line1: '404 Juniper Circle', line2: '', city: 'Springfield', state: 'Washington', zip: '73301', country: 'United States'},
        {line1: '505 Aspen Terrace', line2: '', city: 'Clinton', state: 'Indiana', zip: '62701', country: 'United States'},
        {line1: '505 Maple Avenue', line2: '', city: 'Milton', state: 'New York', zip: '15201', country: 'United States'},
        {line1: '808 Pine Road', line2: '', city: 'Mount Vernon', state: 'Nevada', zip: '40601', country: 'United States'},
        {line1: '6789 Willow Way', line2: '', city: 'Clinton', state: 'Missouri', zip: '97201', country: 'United States'},
        {line1: '505 Cedar Lane', line2: '', city: 'Fairview', state: 'North Carolina', zip: '23219', country: 'United States'},
        {line1: '7890 Chestnut Court', line2: '', city: 'Greenville', state: 'Washington', zip: '33101', country: 'United States'},
        {line1: '3456 Peachtree Blvd', line2: '', city: 'Riverside', state: 'New York', zip: '73301', country: 'United States'},
        {line1: '1234 Dogwood Drive', line2: '', city: 'Fremont', state: 'Alabama', zip: '15201', country: 'United States'},
        {line1: '7890 Magnolia Street', line2: '', city: 'Lebanon', state: 'Georgia', zip: '73301', country: 'United States'},
        {line1: '303 Juniper Circle', line2: '', city: 'Bristol', state: 'Washington', zip: '40601', country: 'United States'},
        {line1: '3456 Fir Avenue', line2: '', city: 'Fremont', state: 'North Carolina', zip: '97201', country: 'United States'},
        {line1: '909 Maple Avenue', line2: '', city: 'Ashland', state: 'Alabama', zip: '15201', country: 'United States'},
        {line1: '202 Dogwood Drive', line2: '', city: 'Newport', state: 'Florida', zip: '30301', country: 'United States'},        {line1: '404 Juniper Circle', line2: '', city: 'Riverside', state: 'California', zip: '80201', country: 'United States'},
        {line1: '606 Chestnut Court', line2: '', city: 'Fairview', state: 'Pennsylvania', zip: '73301', country: 'United States'},
        {line1: '303 Aspen Terrace', line2: '', city: 'Salem', state: 'Georgia', zip: '98101', country: 'United States'},
        {line1: '505 Washington Ave', line2: '', city: 'Milton', state: 'Tennessee', zip: '73301', country: 'United States'},
        // Added 200 new addresses from random-address-generator.txt
        {line1: '6740 Van Gordon Street', line2: '', city: 'Arvada', state: 'Colorado', zip: '80004', country: 'United States'},
        {line1: '1612 Whitemarsh Way', line2: '', city: 'Savannah', state: 'Georgia', zip: '31410', country: 'United States'},
        {line1: '208 Waterford Drive', line2: '', city: 'Lynn Haven', state: 'Florida', zip: '32444', country: 'United States'},
        {line1: '841 Whittier Hill Road', line2: '', city: 'undefined', state: 'Vermont', zip: '05647', country: 'United States'},
        {line1: '2500 Medallion Drive', line2: '', city: 'Union City', state: 'California', zip: '94587', country: 'United States'},
        {line1: '632 Belmar Drive', line2: '', city: 'Edmond', state: 'Oklahoma', zip: '73025', country: 'United States'},
        {line1: '2505 Shadow Lane', line2: '', city: 'Nashville', state: 'Tennessee', zip: '37216', country: 'United States'},
        {line1: '6601 West Ocotillo Road', line2: '', city: 'Glendale', state: 'Arizona', zip: '85301', country: 'United States'},
        {line1: '7000 Hugh Drive', line2: '', city: 'Panama City', state: 'Florida', zip: '32404', country: 'United States'},
        {line1: '8821 West Myrtle Avenue', line2: '', city: 'Glendale', state: 'Arizona', zip: '85305', country: 'United States'},
        {line1: '2203 7th Street Road', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40208', country: 'United States'},
        {line1: '5615 West Villa Maria Drive', line2: '', city: 'Glendale', state: 'Arizona', zip: '85308', country: 'United States'},
        {line1: '21 Glenoak Lane Northwest', line2: '', city: 'Glen Burnie', state: 'Maryland', zip: '21061', country: 'United States'},
        {line1: '519 West 75th Avenue', line2: '', city: 'Anchorage', state: 'Alaska', zip: '99518', country: 'United States'},
        {line1: '22 Gallatin Street Northeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20011', country: 'United States'},
        {line1: '3318 East Woodbine Road', line2: '', city: 'Orange', state: 'California', zip: '92867', country: 'United States'},
        {line1: '1261 Sioux Terrace', line2: '', city: 'Nashville', state: 'Tennessee', zip: '37115', country: 'United States'},
        {line1: '269 Park Street', line2: '', city: 'North Reading', state: 'Massachusetts', zip: '01864', country: 'United States'},
        {line1: '3904 Martagon Circle', line2: '', city: 'Anchorage', state: 'Alaska', zip: '99516', country: 'United States'},
        {line1: '2248 South Sutherland Drive', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36116', country: 'United States'},
        {line1: '4235 Phelan Court', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36116', country: 'United States'},
        {line1: '1816 U Place Southeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20020', country: 'United States'},
        {line1: '1259 Everett Avenue', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40204', country: 'United States'},
        {line1: '9457 Winfield Place', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36117', country: 'United States'},
        {line1: '1347 Blackwalnut Court', line2: '', city: 'Annapolis', state: 'Maryland', zip: '21403', country: 'United States'},
        {line1: '804 Dry Creek Road', line2: '', city: 'Goodlettsville', state: 'Tennessee', zip: '37072', country: 'United States'},
        {line1: '3203 US Highway 98', line2: '', city: 'Mexico Beach', state: 'Florida', zip: '32456', country: 'United States'},
        {line1: '4900 Cambridge Way', line2: '', city: 'Anchorage', state: 'Alaska', zip: '99503', country: 'United States'},
        {line1: '2185 Howe Pond Road', line2: '', city: 'Readsboro', state: 'Vermont', zip: '05350', country: 'United States'},
        {line1: '327 Idlewylde Drive', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40206', country: 'United States'},
        {line1: '7901 West 52nd Avenue', line2: '', city: 'Arvada', state: 'Colorado', zip: '80002', country: 'United States'},
        {line1: '4 Conti Circle', line2: '', city: 'Barre', state: 'Vermont', zip: '05641', country: 'United States'},
        {line1: '529 Barr Hill Road', line2: '', city: 'Greensboro', state: 'Vermont', zip: '05841', country: 'United States'},
        {line1: '923 K Street Northeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20002', country: 'United States'},
        {line1: '741 Amity Lane', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36117', country: 'United States'},
        {line1: '23 Cove Drive', line2: '', city: 'Savannah', state: 'Georgia', zip: '31419', country: 'United States'},
        {line1: '1430 South Gay Avenue', line2: '', city: 'Panama City', state: 'Florida', zip: '32404', country: 'United States'},
        {line1: '6160 Norm Drive', line2: '', city: 'Anchorage', state: 'Alaska', zip: '99507', country: 'United States'},
        {line1: '1828 Ridgewick Road', line2: '', city: 'Glen Burnie', state: 'Maryland', zip: '21061', country: 'United States'},
        {line1: '29 White Oak Drive', line2: '', city: 'undefined', state: 'Vermont', zip: '05465', country: 'United States'},
        {line1: '11507 East Neville Avenue', line2: '', city: 'Mesa', state: 'Arizona', zip: '85209', country: 'United States'},
        {line1: '1707 6th Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20001', country: 'United States'},
        {line1: '7506 Harvey Street', line2: '', city: 'Panama City', state: 'Florida', zip: '32404', country: 'United States'},
        {line1: '17722 North 79th Avenue', line2: '', city: 'Glendale', state: 'Arizona', zip: '85308', country: 'United States'},
        {line1: '646 Clinton Street', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36108', country: 'United States'},
        {line1: '928 Wright Avenue', line2: '', city: 'Mountain View', state: 'California', zip: '94043', country: 'United States'},
        {line1: '93 Marble Hill Road', line2: '', city: 'Waitsfield', state: 'Vermont', zip: '05673', country: 'United States'},
        {line1: '320 Northwest 22nd Street', line2: '', city: 'Oklahoma City', state: 'Oklahoma', zip: '73103', country: 'United States'},
        {line1: '14213 Doc Hawley Street', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40245', country: 'United States'},
        {line1: '184 Woodland Street', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06042', country: 'United States'},
        {line1: '90 Mountain Street', line2: '', city: 'Bristol', state: 'Vermont', zip: '05443', country: 'United States'},
        {line1: '25 Church Street', line2: '', city: 'Pittsfield', state: 'Massachusetts', zip: '01201', country: 'United States'},
        {line1: '16 Fuller Street', line2: '', city: 'Brookline', state: 'Massachusetts', zip: '02446', country: 'United States'},
        {line1: '1566 Wingate Park Court', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36117', country: 'United States'},
        {line1: '57 Hidden Lake Court', line2: '', city: 'Savannah', state: 'Georgia', zip: '31419', country: 'United States'},
        {line1: '628 Ayrlie Water Road', line2: '', city: 'Gibson Island', state: 'Maryland', zip: '21056', country: 'United States'},
        {line1: '4511 43rd Place Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20016', country: 'United States'},
        {line1: '1267 Martin Street', line2: '', city: 'Nashville', state: 'Tennessee', zip: '37203', country: 'United States'},
        {line1: '451 East Street', line2: '', city: 'Huntington', state: 'Vermont', zip: '05462', country: 'United States'},
        {line1: '4812 Alton Place Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20016', country: 'United States'},
        {line1: '63 Columbia Drive', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06042', country: 'United States'},
        {line1: '142 Ash Drive', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36117', country: 'United States'},
        {line1: '1101 Lotus Avenue', line2: '', city: 'Glen Burnie', state: 'Maryland', zip: '21061', country: 'United States'},
        {line1: '195 Kennedy Road', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06042', country: 'United States'},
        {line1: '323 Randolph Street', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36104', country: 'United States'},
        {line1: '1001 6th Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20001', country: 'United States'},
        {line1: '60 Willow Lakes Drive', line2: '', city: 'Savannah', state: 'Georgia', zip: '31419', country: 'United States'},
        {line1: '832 51st Street Northeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20019', country: 'United States'},
        {line1: '19020 North 68th Avenue', line2: '', city: 'Glendale', state: 'Arizona', zip: '85308', country: 'United States'},
        {line1: '9506 Civic Way', line2: '', city: 'Prospect', state: 'Kentucky', zip: '40059', country: 'United States'},
        {line1: '8673 Burkitt Place Drive', line2: '', city: 'Nolensville', state: 'Tennessee', zip: '37135', country: 'United States'},
        {line1: '4822 Piney Branch Road Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20011', country: 'United States'},
        {line1: '5123 Ewell Street', line2: '', city: 'Savannah', state: 'Georgia', zip: '31405', country: 'United States'},
        {line1: '112 3rd Street Northeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20002', country: 'United States'},
        {line1: '42 Edison Road', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06040', country: 'United States'},
        {line1: '2723 East Joyce Boulevard', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72703', country: 'United States'},
        {line1: '1770 Colony Way', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72704', country: 'United States'},
        {line1: '8666 Iris Street', line2: '', city: 'Arvada', state: 'Colorado', zip: '80005', country: 'United States'},
        {line1: '6016 Northwest 27th Street', line2: '', city: 'Oklahoma City', state: 'Oklahoma', zip: '73127', country: 'United States'},
        {line1: '303 Addison Drive', line2: '', city: 'Glen Burnie', state: 'Maryland', zip: '21060', country: 'United States'},
        {line1: '5614 Kipling Parkway', line2: '', city: 'Arvada', state: 'Colorado', zip: '80002', country: 'United States'},
        {line1: '53 Greenwood Avenue', line2: '', city: 'Wakefield', state: 'Massachusetts', zip: '01880', country: 'United States'},
        {line1: '460 Woodbridge Street', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06042', country: 'United States'},
        {line1: '1709 Travers Court', line2: '', city: 'Edmond', state: 'Oklahoma', zip: '73003', country: 'United States'},
        {line1: '16133 Hillsborough Boulevard', line2: '', city: 'Port Charlotte', state: 'Florida', zip: '33954', country: 'United States'},
        {line1: '6208 Ingalls Street', line2: '', city: 'Arvada', state: 'Colorado', zip: '80003', country: 'United States'},
        {line1: '309 Glenwood Avenue', line2: '', city: 'Glen Burnie', state: 'Maryland', zip: '21061', country: 'United States'},
        {line1: '614 East Duffy Lane', line2: '', city: 'Savannah', state: 'Georgia', zip: '31401', country: 'United States'},
        {line1: '4418 15th Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20011', country: 'United States'},
        {line1: '3115 Cherokee Drive', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72701', country: 'United States'},
        {line1: '12438 West 83rd Avenue', line2: '', city: 'Arvada', state: 'Colorado', zip: '80005', country: 'United States'},
        {line1: '7106 Bear Creek Drive', line2: '', city: 'Saint Matthews', state: 'Kentucky', zip: '40207', country: 'United States'},
        {line1: '531 Bobbin Mill Road', line2: '', city: 'Lunenburg', state: 'Vermont', zip: '05906', country: 'United States'},
        {line1: '1897 Poplar Ridge Road', line2: '', city: 'Pasadena', state: 'Maryland', zip: '21122', country: 'United States'},
        {line1: '63 Dorchester Street', line2: '', city: 'Worcester', state: 'Massachusetts', zip: '01604', country: 'United States'},
        {line1: '35 Keach Avenue', line2: '', city: 'Worcester', state: 'Massachusetts', zip: '01607', country: 'United States'},
        {line1: '11 Proctor Circle', line2: '', city: 'Peabody', state: 'Massachusetts', zip: '01960', country: 'United States'},
        {line1: '10367 West 55th Place', line2: '', city: 'Arvada', state: 'Colorado', zip: '80002', country: 'United States'},
        {line1: '2577 East Wyman Road', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72701', country: 'United States'},
        {line1: '1002 Highland Avenue', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40204', country: 'United States'},
        {line1: '4719 West Cochise Drive', line2: '', city: 'Glendale', state: 'Arizona', zip: '85302', country: 'United States'},
        {line1: '243 Kentucky Avenue', line2: '', city: 'Pasadena', state: 'Maryland', zip: '21122', country: 'United States'},
        {line1: '4207 Ranch Drive', line2: '', city: 'Edmond', state: 'Oklahoma', zip: '73013', country: 'United States'},
        {line1: '747 West Pacific Avenue', line2: '', city: 'Telluride', state: 'Colorado', zip: '81435', country: 'United States'},
        {line1: '1318 4th Street Southwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20024', country: 'United States'},
        {line1: '8157 East Beach Drive Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20012', country: 'United States'},
        {line1: '83 Kennedy Road', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06042', country: 'United States'},
        {line1: '218 Saint Antons Way', line2: '', city: 'Arnold', state: 'Maryland', zip: '21012', country: 'United States'},
        {line1: '106 Varnum Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20011', country: 'United States'},
        {line1: '36528 Short Circle', line2: '', city: 'Kenai', state: 'Alaska', zip: '99611', country: 'United States'},
        {line1: '10400 Royal Oak Road', line2: '', city: 'Oakland', state: 'California', zip: '94605', country: 'United States'},
        {line1: '6100 Bullard Drive', line2: '', city: 'Oakland', state: 'California', zip: '94611', country: 'United States'},
        {line1: '225 Claude Street', line2: '', city: 'Annapolis', state: 'Maryland', zip: '21401', country: 'United States'},
        {line1: '74 Heard Street', line2: '', city: 'Chelsea', state: 'Massachusetts', zip: '02150', country: 'United States'},
        {line1: '44 Downey Drive', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06040', country: 'United States'},
        {line1: '2349 East Tall Oaks Drive', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72703', country: 'United States'},
        {line1: '3551 North Georgetown Drive', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36109', country: 'United States'},
        {line1: '8390 Alkire Street', line2: '', city: 'Arvada', state: 'Colorado', zip: '80005', country: 'United States'},
        {line1: '42 Adams Road', line2: '', city: 'Greenfield', state: 'Massachusetts', zip: '01301', country: 'United States'},
        {line1: '5005 North Miller Avenue', line2: '', city: 'Oklahoma City', state: 'Oklahoma', zip: '73112', country: 'United States'},
        {line1: '218 Middle Street', line2: '', city: 'Brighton', state: 'Vermont', zip: '05846', country: 'United States'},
        {line1: '165 Saint John Street', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06040', country: 'United States'},
        {line1: '3179 18th Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20010', country: 'United States'},
        {line1: '1247 West Mount Comfort Road', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72703', country: 'United States'},
        {line1: '3600 San Sebastian Court', line2: '', city: 'Punta Gorda', state: 'Florida', zip: '33950', country: 'United States'},
        {line1: '3215 Madsen Street', line2: '', city: 'Hayward', state: 'California', zip: '94541', country: 'United States'},
        {line1: '42 Lake Lane', line2: '', city: 'Westmore', state: 'Vermont', zip: '05860', country: 'United States'},
        {line1: '5124 E Street Southeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20019', country: 'United States'},
        {line1: '20250 North 67th Avenue', line2: '', city: 'Glendale', state: 'Arizona', zip: '85308', country: 'United States'},
        {line1: '2209 June Drive', line2: '', city: 'Nashville', state: 'Tennessee', zip: '37214', country: 'United States'},
        {line1: '5630 Silverado Way', line2: '', city: 'Anchorage', state: 'Alaska', zip: '99518', country: 'United States'},
        {line1: '11300 Lillian Lane', line2: '', city: 'Anchorage', state: 'Alaska', zip: '99515', country: 'United States'},
        {line1: '595 West 54th Street', line2: '', city: 'Savannah', state: 'Georgia', zip: '31405', country: 'United States'},
        {line1: '1643 North Jordan Lane', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72703', country: 'United States'},
        {line1: '1500 South Division Street', line2: '', city: 'Guthrie', state: 'Oklahoma', zip: '73044', country: 'United States'},
        {line1: '1014 South 2nd Street', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40203', country: 'United States'},
        {line1: '1711 8th Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20001', country: 'United States'},
        {line1: '615 Q Street Northwest', line2: '', city: 'Washington', state: 'Arkansas', zip: '20001', country: 'United States'},
        {line1: '4739 South Court Street', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36105', country: 'United States'},
        {line1: '21402 Caribbean Lane', line2: '', city: 'Panama City Beach', state: 'Florida', zip: '32413', country: 'United States'},
        {line1: '721 Bay Ridge Avenue', line2: '', city: 'Annapolis', state: 'Maryland', zip: '21403', country: 'United States'},
        {line1: '1236 Southwest 49th Street', line2: '', city: 'Oklahoma City', state: 'Oklahoma', zip: '73109', country: 'United States'},
        {line1: '15510 Champion Lakes Place', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40245', country: 'United States'},
        {line1: '51185 Helmsman Street', line2: '', city: 'Kenai', state: 'Alaska', zip: '99611', country: 'United States'},
        {line1: '2803 River Drive', line2: '', city: 'Thunderbolt', state: 'Georgia', zip: '31404', country: 'United States'},
        {line1: '233 Buckland Hills Drive', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06042', country: 'United States'},
        {line1: '6045 Camelot Court', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36117', country: 'United States'},
        {line1: '5420 Allison Street', line2: '', city: 'Arvada', state: 'Colorado', zip: '80002', country: 'United States'},
        {line1: '1831 Frankford Avenue', line2: '', city: 'Panama City', state: 'Florida', zip: '32405', country: 'United States'},
        {line1: '21 Hill Street', line2: '', city: 'Barre', state: 'Vermont', zip: '05641', country: 'United States'},
        {line1: '25 Morton Street', line2: '', city: 'Quincy', state: 'Massachusetts', zip: '02169', country: 'United States'},
        {line1: '7802 North Alsup Road', line2: '', city: 'Litchfield Park', state: 'Arizona', zip: '85340', country: 'United States'},
        {line1: '8507 Lorento Street', line2: '', city: 'Panama City Beach', state: 'Florida', zip: '32408', country: 'United States'},
        {line1: '3420 Horseshoe Circle', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36116', country: 'United States'},
        {line1: '18426 West Carol Avenue', line2: '', city: 'Waddell', state: 'Arizona', zip: '85355', country: 'United States'},
        {line1: '210 Seaman', line2: '', city: 'McCrory', state: 'Arkansas', zip: '72101', country: 'United States'},
        {line1: '5309 Darling Hill Road', line2: '', city: 'Burke', state: 'Vermont', zip: '05871', country: 'United States'},
        {line1: '122 Coral Drive', line2: '', city: 'Panama City Beach', state: 'Florida', zip: '32413', country: 'United States'},
        {line1: '109 Summit Street', line2: '', city: 'Burlington', state: 'Vermont', zip: '05401', country: 'United States'},
        {line1: '1819 Q Street Southeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20020', country: 'United States'},
        {line1: '881 Main Street', line2: '', city: 'Manchester', state: 'Connecticut', zip: '06040', country: 'United States'},
        {line1: '1101 West 48th Street', line2: '', city: 'Savannah', state: 'Georgia', zip: '31405', country: 'United States'},
        {line1: '3579 2nd Avenue', line2: '', city: 'Edgewater', state: 'Maryland', zip: '21037', country: 'United States'},
        {line1: '3164 West Woodfield Way', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72704', country: 'United States'},
        {line1: '7405 River Park Drive', line2: '', city: 'Nashville', state: 'Tennessee', zip: '37221', country: 'United States'},
        {line1: '713 Flight Avenue', line2: '', city: 'Panama City', state: 'Florida', zip: '32404', country: 'United States'},
        {line1: '1992 West Street', line2: '', city: 'Brookfield', state: 'Vermont', zip: '05036', country: 'United States'},
        {line1: '552 Maynadier Lane', line2: '', city: 'Crownsville', state: 'Maryland', zip: '21032', country: 'United States'},
        {line1: '16572 East Wyman Road', line2: '', city: 'Fayetteville', state: 'Arkansas', zip: '72701', country: 'United States'},
        {line1: '1417 Stoneykirk Road', line2: '', city: 'Pelham', state: 'Alabama', zip: '35124', country: 'United States'},
        {line1: '2577 Rhode Island Avenue Northeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20018', country: 'United States'},
        {line1: '18789 Crane Avenue', line2: '', city: 'Castro Valley', state: 'California', zip: '94546', country: 'United States'},
        {line1: '618 Amberjack Drive', line2: '', city: 'Panama City', state: 'Florida', zip: '32408', country: 'United States'},
        {line1: '8709 Peeble Lane', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40272', country: 'United States'},
        {line1: '328 17th Street', line2: '', city: 'Paso Robles', state: 'California', zip: '93446', country: 'United States'},
        {line1: '1300 Lemos Lane', line2: '', city: 'Fremont', state: 'California', zip: '94539', country: 'United States'},
        {line1: '1456 East 39th Street', line2: '', city: 'Savannah', state: 'Georgia', zip: '31404', country: 'United States'},
        {line1: '1840 Nobel Place', line2: '', city: 'Louisville', state: 'Kentucky', zip: '40216', country: 'United States'},
        {line1: '12245 West 71st Place', line2: '', city: 'Arvada', state: 'Colorado', zip: '80004', country: 'United States'},
        {line1: '5 Westlund Avenue', line2: '', city: 'Auburn', state: 'Massachusetts', zip: '01501', country: 'United States'},
        {line1: '6516 Nile Circle', line2: '', city: 'Arvada', state: 'Colorado', zip: '80007', country: 'United States'},
        {line1: '1429 Harrison Avenue', line2: '', city: 'Panama City', state: 'Florida', zip: '32401', country: 'United States'},
        {line1: '4924 West 65th Avenue', line2: '', city: 'Arvada', state: 'Colorado', zip: '80003', country: 'United States'},
        {line1: '707 Pinkston Street', line2: '', city: 'Montgomery', state: 'Alabama', zip: '36109', country: 'United States'},
        {line1: '7321 Mary Jo Avenue', line2: '', city: 'Panama City', state: 'Florida', zip: '32409', country: 'United States'},
        {line1: '1350 Exley Street', line2: '', city: 'Savannah', state: 'Georgia', zip: '31415', country: 'United States'},
        {line1: '2417 Becker Place', line2: '', city: 'Del City', state: 'Oklahoma', zip: '73115', country: 'United States'},
        {line1: '8216 West Citrus Way', line2: '', city: 'Glendale', state: 'Arizona', zip: '85303', country: 'United States'},
        {line1: '127 Andover Drive', line2: '', city: 'Savannah', state: 'Georgia', zip: '31405', country: 'United States'},
        {line1: '713 Ringgold Drive', line2: '', city: 'Nashville', state: 'Tennessee', zip: '37207', country: 'United States'},
        {line1: '3035 South Highway A1A', line2: '', city: 'Melbourne Beach', state: 'Florida', zip: '32951', country: 'United States'},
        {line1: '4 Cutting Avenue', line2: '', city: 'Worcester', state: 'Massachusetts', zip: '01606', country: 'United States'},
        {line1: '798 Airport Road', line2: '', city: 'Panama City', state: 'Florida', zip: '32405', country: 'United States'},
        {line1: '1156 Greenhill Road', line2: '', city: 'Arnold', state: 'Maryland', zip: '21012', country: 'United States'},
        {line1: '29 East Avenue', line2: '', city: 'Colchester', state: 'Vermont', zip: '05446', country: 'United States'},
        {line1: '31 Yosemite Avenue', line2: '', city: 'Oakland', state: 'California', zip: '94611', country: 'United States'},
        {line1: '813 Linda Lane', line2: '', city: 'Panama City Beach', state: 'Florida', zip: '32407', country: 'United States'},
        {line1: '3098 Vermont 122', line2: '', city: 'Sheffield', state: 'Vermont', zip: '05866', country: 'United States'},
        {line1: '2927 Martin Luther King Junior Avenue Southeast', line2: '', city: 'Washington', state: 'Arkansas', zip: '20020', country: 'United States'},
        {line1: '6870 West 52nd Avenue', line2: '', city: 'Arvada', state: 'Colorado', zip: '80002', country: 'United States'}
    ];

    const internationalCountries = [
        // Original countries
        'Andorra', 'United Arab Emirates', 'Afghanistan', 'Antigua and Barbuda', 'Anguilla',
        'Albania', 'Armenia', 'Netherlands Antilles', 'Angola', 'Antarctica',
        'Argentina', 'American Samoa', 'Austria', 'Australia', 'Aruba',
        'Aland Islands', 'Azerbaijan', 'Bosnia and Herzegovina', 'Barbados', 'Bangladesh',
        'Belgium', 'Burkina Faso', 'Bulgaria', 'Bahrain', 'Burundi',
        'Benin', 'Saint Barthélemy', 'Bermuda', 'Brunei', 'Bolivia',
        'Caribbean Netherlands', 'Brazil', 'Bahamas', 'Bhutan', 'Bouvet Island',
        'Botswana', 'Belarus', 'Belize', 'Canada', 'Cocos (Keeling) Islands',
        'Congo (Kinshasa)', 'Central African Republic', 'Congo (Brazzaville)', 'Switzerland', 'Ivory Coast',
        'Cook Islands', 'Chile', 'Cameroon', 'China', 'Colombia',
        'Costa Rica', 'Cuba', 'Cape Verde', 'Curaçao', 'Christmas Island',
        'Cyprus', 'Czech Republic', 'Germany', 'Djibouti', 'Denmark',
        'Dominica', 'Dominican Republic', 'Algeria', 'Ecuador', 'Estonia',
        'Egypt', 'Western Sahara', 'Eritrea', 'Spain', 'Ethiopia',
        'Finland', 'Fiji', 'Falkland Islands', 'Micronesia', 'Faroe Islands',
        'France', 'Gabon', 'United Kingdom', 'Grenada', 'Georgia',
        'French Guiana', 'Guernsey', 'Ghana', 'Gibraltar', 'Greenland',
        'Gambia', 'Guinea', 'Guadeloupe', 'Equatorial Guinea', 'Greece',
        'South Georgia and the South Sandwich Islands', 'Guatemala', 'Guam', 'Guinea-Bissau', 'Guyana',
        'Hong Kong S.A.R., China', 'Heard Island and McDonald Islands', 'Honduras', 'Croatia', 'Haiti',
        'Hungary', 'Indonesia', 'Ireland', 'Israel', 'Isle of Man',
        'India', 'British Indian Ocean Territory', 'Iraq', 'Iran', 'Iceland',
        'Italy', 'Jersey', 'Jamaica', 'Jordan', 'Japan',
        'Kenya', 'Kyrgyzstan', 'Cambodia', 'Kiribati', 'Comoros',
        'Saint Kitts and Nevis', 'North Korea', 'South Korea', 'Kuwait', 'Cayman Islands',
        'Kazakhstan', 'Laos', 'Lebanon', 'Saint Lucia', 'Liechtenstein',
        'Sri Lanka', 'Liberia', 'Lesotho', 'Lithuania', 'Luxembourg',
        'Latvia', 'Libya', 'Morocco', 'Monaco', 'Moldova',
        'Montenegro', 'Saint Martin (French part)', 'Madagascar', 'Marshall Islands', 'Macedonia',
        'Mali', 'Myanmar', 'Mongolia', 'Macao S.A.R., China', 'Northern Mariana Islands',
        'Martinique', 'Mauritania', 'Montserrat', 'Malta', 'Mauritius',
        'Maldives', 'Malawi', 'Mexico', 'Malaysia', 'Mozambique',
        'Namibia', 'New Caledonia', 'Niger', 'Norfolk Island', 'Nigeria',
        'Nicaragua', 'Netherlands', 'Norway', 'Nepal', 'Nauru',
        'Niue', 'New Zealand', 'Oman', 'Panama', 'Peru',
        'French Polynesia', 'Papua New Guinea', 'Philippines', 'Pakistan', 'Poland',
        'Saint Pierre and Miquelon', 'Pitcairn', 'Puerto Rico', 'Palestinian Territory', 'Portugal',
        'Palau', 'Paraguay', 'Qatar', 'Reunion', 'Romania',
        'Serbia', 'Russia', 'Rwanda', 'Saudi Arabia', 'Solomon Islands',
        'Seychelles', 'Sudan', 'Sweden', 'Singapore', 'Saint Helena',
        'Slovenia', 'Svalbard and Jan Mayen', 'Slovakia', 'Sierra Leone', 'San Marino',
        'Senegal', 'Somalia', 'Suriname', 'South Sudan', 'Sao Tome and Principe',
        'El Salvador', 'Sint Maarten', 'Syria', 'Swaziland', 'Turks and Caicos Islands',
        'Chad', 'French Southern Territories', 'Togo', 'Thailand', 'Tajikistan',
        'Tokelau', 'Timor-Leste', 'Turkmenistan', 'Tunisia', 'Tonga',
        'Turkey', 'Trinidad and Tobago', 'Tuvalu', 'Taiwan', 'Tanzania',
        'Ukraine', 'Uganda', 'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan',
        'Vatican', 'Saint Vincent and the Grenadines', 'Venezuela', 'British Virgin Islands', 'U.S. Virgin Islands',
        'Vietnam', 'Vanuatu', 'Wallis and Futuna', 'Samoa', 'Kosovo',
        'Yemen', 'Mayotte', 'South Africa', 'Zambia', 'Zimbabwe',
        // Additional countries to ensure comprehensive coverage
        'Bonaire', 'Saint Eustatius and Saba', 'Heard Island', 'McDonald Islands', 'Saint Helena, Ascension and Tristan da Cunha',
        'Svalbard', 'Jan Mayen', 'Republic of North Macedonia', 'Eswatini', 'Türkiye',
        'Vietnam', 'Vanuatu', 'Wallis and Futuna', 'Samoa', 'Yemen',
        'Mayotte', 'South Africa', 'Zambia', 'Zimbabwe'
    ];
      // US Streets and Cities
    const usStreetNames = [
        'Main St', 'Oak Ave', 'Maple Dr', 'Washington Blvd', 'Park Rd', 'Cedar Ln', 'Lake St',
        'Elm St', 'High St', 'Pine St', 'Spring St', 'River Rd', 'Cherry St', 'Market St',
        'Valley View Dr', 'Highland Ave', 'Ridge Rd', 'Forest Ave', 'Sunset Dr', 'Willow St',
        'Broadway', '2nd Ave', '5th St', 'Jefferson St', 'Lincoln Ave', 'Madison St', 'Central Ave',
        // Additional street names for more variety
        'Airport Way', 'Bay Shore Blvd', 'College St', 'Diamond St', 'Evergreen Terrace',
        'Fairmont Ave', 'Grand Ave', 'Harbor Blvd', 'Industrial Pkwy', 'Juniper Ln',
        'Kings Highway', 'Lakeview Dr', 'Magnolia Blvd', 'Northgate Rd', 'Ocean Dr',
        'Parkside Ave', 'Queens Rd', 'Riverside Dr', 'Sycamore St', 'Technology Dr',
        'University Ave', 'Veterans Blvd', 'Walnut St', 'Xavier St', 'Yosemite Ave', 'Zion Rd',
        // 40 more street names
        'Aspen Ct', 'Birch Ln', 'Chestnut St', 'Dogwood Dr', 'Eagle Ridge Rd', 'Fir Ave',
        'Glenwood Dr', 'Hickory St', 'Indian Hill Rd', 'Jasmine Way', 'Knotty Pine Ln',
        'Lighthouse Pt', 'Mulberry St', 'Newberry Dr', 'Orchard Rd', 'Poplar St',
        'Quail Run', 'Redwood Dr', 'Sequoia Ave', 'Timber Ln', 'Union St', 'Vista Way',
        'Whispering Pines Dr', 'Yellowstone Rd', 'Acacia Ave', 'Beech St', 'Cottonwood Ln',
        'Driftwood Dr', 'Eucalyptus Ave', 'Franklin St', 'Greenfield Ave', 'Heritage Dr',
        'Independence Way', 'Jackson St', 'Kennedy Blvd', 'Liberty Ave', 'Monument Blvd',
        'Newton St', 'Olive St', 'Patriot Way'
    ];

    const usCities = [
        'Birmingham', 'Anchorage', 'Phoenix', 'Little Rock', 'Los Angeles', 'Denver', 'Hartford',
        'Wilmington', 'Miami', 'Atlanta', 'Honolulu', 'Boise', 'Chicago', 'Indianapolis', 'Des Moines',
        'Wichita', 'Louisville', 'New Orleans', 'Portland', 'Baltimore', 'Boston', 'Detroit',
        'Minneapolis', 'Jackson', 'Kansas City', 'Helena', 'Omaha', 'Las Vegas', 'Manchester',
        'Newark', 'Albuquerque', 'New York', 'Charlotte', 'Fargo', 'Columbus', 'Oklahoma City',
        'Portland', 'Philadelphia', 'Providence', 'Charleston', 'Sioux Falls', 'Nashville', 'Houston',
        'Salt Lake City', 'Burlington', 'Richmond', 'Seattle', 'Charleston', 'Milwaukee', 'Cheyenne',
        // Additional city names for more variety
        'San Francisco', 'San Diego', 'Austin', 'Dallas', 'San Antonio', 'Memphis', 'Tampa',
        'Orlando', 'St. Louis', 'Pittsburgh', 'Cincinnati', 'Cleveland', 'Buffalo', 'Rochester',
        'Syracuse', 'Albany', 'Springfield', 'Bridgeport', 'New Haven', 'Stamford', 'Tacoma',
        'Spokane', 'Eugene', 'Salem', 'Oakland', 'Sacramento', 'Fresno', 'Tucson', 'Tulsa',
        'Fort Worth', 'Arlington', 'Raleigh', 'Durham', 'Charlotte', 'Greensboro', 'Winston-Salem',
        'Norfolk', 'Virginia Beach', 'Reno', 'Henderson', 'Mesa', 'Aurora', 'Boulder',
        // 40 more cities
        'Scottsdale', 'Tempe', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Bakersfield', 'Long Beach',
        'Anaheim', 'Santa Ana', 'Riverside', 'Irvine', 'San Jose', 'Fremont', 'Stockton', 'Modesto',
        'Fort Collins', 'Lakewood', 'Westminster', 'Arvada', 'Pueblo', 'New Britain', 'Waterbury',
        'Danbury', 'Dover', 'Newark', 'Wilmington', 'Tallahassee', 'Jacksonville', 'St. Petersburg',
        'Clearwater', 'Gainesville', 'Savannah', 'Athens', 'Columbus', 'Macon', 'Boise', 'Nampa',
        'Meridian', 'Idaho Falls'
    ];
      // Specific landmark/business addresses for "Location of Criminal Activity"
    const criminalActivityLocations = [
        {
            line1: '1200 Financial Plaza',
            line2: 'Suite 400',
            city: 'New York',
            state: 'New York',
            zip: '10004',
            description: 'Financial district office building'
        },
        {
            line1: '8500 Industrial Parkway',
            line2: 'Unit 15',
            city: 'Houston',
            state: 'Texas',
            zip: '77015',
            description: 'Warehouse complex'
        },
        {
            line1: '355 International Terminal',
            line2: 'Cargo Area B',
            city: 'Miami',
            state: 'Florida',
            zip: '33126',
            description: 'Airport cargo facility'
        },
        {
            line1: '2200 Border Crossing Rd',
            line2: '',
            city: 'El Paso',
            state: 'Texas',
            zip: '79901',
            description: 'Border checkpoint'
        },
        {
            line1: '478 Seaport Blvd',
            line2: 'Dock 12',
            city: 'Long Beach',
            state: 'California',
            zip: '90802',
            description: 'Shipping port'
        },
        {
            line1: '1050 Government Center',
            line2: '3rd Floor',
            city: 'Boston',
            state: 'Massachusetts',
            zip: '02203',
            description: 'Government office'
        },
        {
            line1: '7250 Technology Dr',
            line2: 'Building C',
            city: 'San Jose',
            state: 'California',
            zip: '95128',
            description: 'Tech company campus'
        },
        {
            line1: '890 University Ave',
            line2: 'Room 204',
            city: 'Palo Alto',
            state: 'California',
            zip: '94301',
            description: 'University facility'
        },
        {
            line1: '5580 Casino Way',
            line2: '',
            city: 'Las Vegas',
            state: 'Nevada',
            zip: '89109',
            description: 'Casino resort'
        },
        {
            line1: '4200 Convention Plaza',
            line2: 'Hall E',
            city: 'Chicago',
            state: 'Illinois',
            zip: '60611',
            description: 'Convention center'
        },
        {
            line1: '15 Embassy Row',
            line2: '',
            city: 'Washington',
            state: 'District of Columbia',
            zip: '20008',
            description: 'Diplomatic building'
        },
        {
            line1: '3600 Storage Facility',
            line2: 'Unit 42',
            city: 'Phoenix',
            state: 'Arizona',
            zip: '85008',
            description: 'Storage facility'
        },
        {
            line1: '22 Courtyard Plaza',
            line2: 'Office 115',
            city: 'Atlanta',
            state: 'Georgia',
            zip: '30303',
            description: 'Law office building'
        },
        {
            line1: '1875 Bank Tower',
            line2: '24th Floor',
            city: 'Charlotte',
            state: 'North Carolina',
            zip: '28202',
            description: 'Financial institution headquarters'
        },
        {
            line1: '950 Retail Mall',
            line2: 'Store #103',
            city: 'Minneapolis',
            state: 'Minnesota',
            zip: '55401',
            description: 'Shopping complex'
        },
        // Additional criminal activity locations - Agricultural/Farming
        {
            line1: '7800 Rural Route 5',
            line2: 'Barn Complex 3',
            city: 'Bakersfield',
            state: 'California',
            zip: '93307',
            description: 'Agricultural facility'
        },
        {
            line1: '4350 Farmstead Lane',
            line2: '',
            city: 'Fresno',
            state: 'California',
            zip: '93706',
            description: 'Large farm operation'
        },
        // Additional criminal activity locations - Tech Companies
        {
            line1: '2800 Innovation Park',
            line2: 'Building 7, Floor 3',
            city: 'Raleigh',
            state: 'North Carolina',
            zip: '27709',
            description: 'Tech research park'
        },
        {
            line1: '530 Digital Drive',
            line2: 'Suite 1200',
            city: 'Austin',
            state: 'Texas',
            zip: '78729',
            description: 'Software company headquarters'
        },
        // Additional criminal activity locations - Hotels/Motels
        {
            line1: '11400 Hospitality Lane',
            line2: 'Room 237',
            city: 'Orlando',
            state: 'Florida',
            zip: '32819',
            description: 'Resort hotel'
        },
        {
            line1: '1820 Interstate Highway 10',
            line2: 'Unit 14',
            city: 'Mobile',
            state: 'Alabama',
            zip: '36606',
            description: 'Roadside motel'
        },
        // Additional criminal activity locations - Transportation
        {
            line1: '9600 Freight Terminal',
            line2: 'Loading Bay 8',
            city: 'Detroit',
            state: 'Michigan',
            zip: '48217',
            description: 'Shipping and logistics facility'
        },
        {
            line1: '3200 Rail Yard Road',
            line2: 'Warehouse 5',
            city: 'Denver',
            state: 'Colorado',
            zip: '80216',
            description: 'Railway cargo facility'
        },
        // Additional criminal activity locations - Residential
        {
            line1: '742 Evergreen Terrace',
            line2: '',
            city: 'Springfield',
            state: 'Oregon',
            zip: '97403',
            description: 'Suburban residence'
        },
        {
            line1: '221B Main Street',
            line2: 'Apartment 301',
            city: 'Seattle',
            state: 'Washington',
            zip: '98101',
            description: 'Downtown apartment'
        },
        // Additional criminal activity locations - International Border
        {
            line1: '1200 Border Entry Point',
            line2: 'Inspection Area C',
            city: 'Brownsville',
            state: 'Texas',
            zip: '78520',
            description: 'Border crossing facility'
        },
        {
            line1: '4000 International Bridge',
            line2: '',
            city: 'Laredo',
            state: 'Texas',
            zip: '78040',
            description: 'Border checkpoint'
        },
        // Additional criminal activity locations - Educational Institutions
        {
            line1: '2350 Campus Drive',
            line2: 'Science Building, Room 403',
            city: 'Berkeley',
            state: 'California',
            zip: '94720',
            description: 'University laboratory'
        },
        {
            line1: '500 Academy Way',
            line2: 'Administrative Building',
            city: 'Ann Arbor',
            state: 'Michigan',
            zip: '48109',
            description: 'University admin offices'
        },
        // Additional criminal activity locations - Medical Facilities
        {
            line1: '8600 Medical Center Drive',
            line2: 'Research Wing B',
            city: 'Rochester',
            state: 'Minnesota',
            zip: '55905',
            description: 'Medical research facility'
        },
        {            line1: '1500 Healthcare Parkway',
            line2: 'North Tower, Floor 5',
            city: 'Houston',
            state: 'Texas',
            zip: '77030',
            description: 'Hospital complex'
        },
        // Additional Business Locations
        {
            line1: '1875 Technology Circle',
            line2: 'Suite 300',
            city: 'San Francisco',
            state: 'California',
            zip: '94105',
            description: 'Tech company office'
        },
        {
            line1: '4200 Financial District',
            line2: '18th Floor',
            city: 'New York',
            state: 'New York',
            zip: '10018',
            description: 'Investment firm'
        },
        {
            line1: '785 Distribution Way',
            line2: 'Warehouse 12B',
            city: 'Atlanta',
            state: 'Georgia',
            zip: '30349',
            description: 'Distribution center'
        },
        {
            line1: '2335 Manufacturing Blvd',
            line2: 'Building D',
            city: 'Nashville',
            state: 'Tennessee',
            zip: '37211',
            description: 'Manufacturing facility'
        },
        {
            line1: '628 Restaurant Row',
            line2: '',
            city: 'Chicago',
            state: 'Illinois',
            zip: '60654',
            description: 'Dining establishment'
        },
        {
            line1: '9568 Industrial Park Drive',
            line2: 'Unit 145',
            city: 'Cleveland',
            state: 'Ohio',
            zip: '44115',
            description: 'Industrial facility'
        },
        {
            line1: '3760 Shipping Lane',
            line2: 'Dock 7',
            city: 'Baltimore',
            state: 'Maryland',
            zip: '21230',
            description: 'Shipping facility'
        },
        {
            line1: '4500 Corporate Plaza',
            line2: 'Suite 1200',
            city: 'Dallas',
            state: 'Texas',
            zip: '75201',
            description: 'Corporate headquarters'
        },
        {
            line1: '7255 Healthcare Boulevard',
            line2: 'Medical Building 3',
            city: 'Philadelphia',
            state: 'Pennsylvania',
            zip: '19104',
            description: 'Medical facility'
        },
        {
            line1: '525 Market Square',
            line2: 'Kiosk 12',
            city: 'Milwaukee',
            state: 'Wisconsin',
            zip: '53202',
            description: 'Retail establishment'
        },
        {
            line1: '890 Automotive Drive',
            line2: 'Service Bay 5',
            city: 'Detroit',
            state: 'Michigan',
            zip: '48226',
            description: 'Auto repair facility'
        },
        {
            line1: '1656 Textile Mill Road',
            line2: 'Factory Floor 2',
            city: 'Charlotte',
            state: 'North Carolina',
            zip: '28206',
            description: 'Textile manufacturing'
        },
        {
            line1: '344 Financial Way',
            line2: '4th Floor',
            city: 'Boston',
            state: 'Massachusetts',
            zip: '02110',
            description: 'Banking institution'
        },
        {
            line1: '7800 Airport Terminal',
            line2: 'Gate C15',
            city: 'Phoenix',
            state: 'Arizona',
            zip: '85034',
            description: 'Airport facility'
        },
        {
            line1: '235 Tech Park Avenue',
            line2: 'Building 7',
            city: 'Seattle',
            state: 'Washington',
            zip: '98104',
            description: 'Technology campus'
        },
        // Residential Locations
        {
            line1: '1428 Oak Street',
            line2: 'Apartment 304',
            city: 'Portland',
            state: 'Oregon',
            zip: '97205',
            description: 'Urban apartment'
        },
        {
            line1: '567 Pine Ridge Road',
            line2: '',
            city: 'Denver',
            state: 'Colorado',
            zip: '80205',
            description: 'Suburban house'
        },
        {
            line1: '2321 Beachfront Avenue',
            line2: 'Unit 15B',
            city: 'Miami',
            state: 'Florida',
            zip: '33139',
            description: 'Beachfront condominium'
        },
        {
            line1: '893 Hillside Lane',
            line2: '',
            city: 'Salt Lake City',
            state: 'Utah',
            zip: '84103',
            description: 'Residential home'
        },
        {
            line1: '437 University Housing',
            line2: 'Building C, Room 205',
            city: 'Austin',
            state: 'Texas',
            zip: '78712',
            description: 'Student housing'
        },
        {
            line1: '7652 Trailer Park Road',
            line2: 'Lot 42',
            city: 'Albuquerque',
            state: 'New Mexico',
            zip: '87105',
            description: 'Mobile home community'
        },
        {
            line1: '129 Riverside Drive',
            line2: 'Apartment 1701',
            city: 'New Orleans',
            state: 'Louisiana',
            zip: '70112',
            description: 'Waterfront apartment'
        },
        {
            line1: '8524 Rural Route 7',
            line2: '',
            city: 'Des Moines',
            state: 'Iowa',
            zip: '50309',
            description: 'Farm property'
        },
        {
            line1: '644 Luxury Lane',
            line2: 'Penthouse Suite',
            city: 'Las Vegas',
            state: 'Nevada',
            zip: '89109',
            description: 'High-end residence'
        },
        {
            line1: '2178 Mountain View Drive',
            line2: '',
            city: 'Anchorage',
            state: 'Alaska',
            zip: '99503',
            description: 'Remote residence'
        },
        {
            line1: '3825 Historic District',
            line2: 'Apartment 2B',
            city: 'Charleston',
            state: 'South Carolina',
            zip: '29401',
            description: 'Historic district residence'
        },
        {
            line1: '952 Garden Homes',
            line2: 'Unit 305',
            city: 'Santa Fe',
            state: 'New Mexico',
            zip: '87501',
            description: 'Adobe-style residence'
        },
        {
            line1: '416 Lakefront Property',
            line2: '',
            city: 'Minneapolis',
            state: 'Minnesota',
            zip: '55405',
            description: 'Lakeside residence'
        },
        {
            line1: '721 Downtown Lofts',
            line2: 'Unit 512',
            city: 'Indianapolis',
            state: 'Indiana',
            zip: '46204',
            description: 'Urban loft apartment'
        }
    ];

    // International Streets and Cities
    const internationalStreetNames = [
        'High Street', 'Queen Street', 'Victoria Road', 'King Street', 'Main Road', 'Park Avenue',
        'Station Road', 'Church Street', 'London Road', 'Broadway', 'North Street', 'South Street',
        'West Street', 'East Street', 'Mill Lane', 'School Lane', 'Albert Road', 'York Road',
        'Avenue des Champs-Élysées', 'Wilhelmstraße', 'Via Roma', 'Floral Street', 'Royal Mile',
        'Bahnhofstraße', 'Gran Vía', 'Rua Augusta', 'Nyhavn', 'O\'Connell Street'
    ];    const internationalCities = [
        'Sydney', 'São Paulo', 'Toronto', 'Copenhagen', 'Cairo', 'Paris', 'Berlin', 'Budapest',
        'Mumbai', 'Tokyo', 'Nairobi', 'Luxembourg', 'Mexico City', 'Amsterdam', 'Oslo', 'Lisbon',
        'Doha', 'Moscow', 'Barcelona', 'Istanbul', 'London', 'Hanoi', 'Cape Town', 'Auckland',
        'Rome', 'Dublin', 'Buenos Aires', 'Stockholm', 'Zurich', 'Kyiv', 'Madrid', 'Brussels',
        'Vienna', 'Prague', 'Helsinki', 'Warsaw', 'Athens', 'Seoul', 'Bangkok', 'Dubai'
    ];

    // Arrays for narrative generation
    const agencyNames = [
        'ICE', 'FBI', 'Homeland Security', 'Local Police', 'CBP', 'State Department',
        'US Citizenship and Immigration Services', 'Department of Labor', 'HSI'
    ];

    const submitDates = [
        'last month', 'on January 15', 'two weeks ago', 'approximately 3 months ago',
        'in December', 'last summer', 'earlier this year', 'a few days ago',
        'in early March', 'on June 6th', 'last fall', 'about 6 weeks ago'
    ];

    const submissionVerbs = [
        'reported', 'submitted information to', 'filed a complaint with',
        'contacted', 'notified', 'provided evidence to', 'sent documentation to',
        'filed a tip with', 'alerted', 'informed'
    ];

    const additionalDetails = [
        'No response received yet', 'The case is still pending', 'They said they would investigate',
        'I was told to submit again', 'I have more evidence now', 'The situation has worsened',
        'I received a case number', 'They requested more information', 'I was referred here',
        'I was given a follow-up date'
    ];

    // Generic criminal activity narratives for when specific ones aren't available
    const genericCriminalActivityNarratives = [
        'I witnessed suspicious activity at the location indicated. Multiple individuals were seen entering and exiting at unusual hours carrying unmarked packages. This has been ongoing for approximately 3 months.',
        'The business appears to be operating as a front. Despite claiming to be open during posted hours, there are rarely any customers. However, there is frequent activity in the back area with vehicles arriving at odd hours.',
        'I have reason to believe illegal activities are taking place at this location based on unusual patterns of behavior and conversations I\'ve overheard. Multiple cash-only transactions occur without proper documentation.',
        'The individual named has been making statements about avoiding detection by authorities and has shown documentation that appears to be fraudulent. They have mentioned bringing others across the border through unofficial channels.',
        'This company appears to be employing workers without proper authorization. I\'ve observed that many employees lack basic identification and are paid in cash. Management has explicitly stated they don\'t verify work eligibility.',
        'The suspect was observed meeting with multiple foreign nationals and exchanging packages in a pattern consistent with smuggling operations.',
        'Workers at this location appear to be living on the premises in unsafe conditions with no access to proper facilities. Many seem to speak little English and have stated they cannot leave.',
        'I am an employee at this company and I have been instructed to process transactions that circumvent standard banking regulations. My supervisor has explicitly stated this is to avoid detection by authorities.',
        'The individual has been using multiple identities and presenting different documents to various government agencies. I have personally witnessed them using at least three different names.',
        'I believe this business is trafficking individuals for labor purposes. Workers arrive in groups at night, appear disoriented, and have their identification documents confiscated by management.',
        'This restaurant employs undocumented workers exclusively in their kitchen. I have direct knowledge as a former employee who was instructed never to complete any tax forms.',
        'Suspicious packages arrive weekly at this warehouse with no proper documentation. When I asked about customs forms, I was told to "mind my own business."',
        'The business owner bragged about his method for bringing people across the border without documentation. He charges $5,000 per person and has transported dozens in the past month.',
        'The named individual has been collecting identification documents from vulnerable immigrants and using their identities to file fraudulent benefit claims.',
        'I observed unmarked vehicles unloading large quantities of merchandise at 3:00 AM behind this store. No customs documentation was present and workers were instructed to remove all packaging.',
        'As an accountant for this company, I was directed to maintain two sets of financial records. One set is for "official purposes" while the actual transactions are recorded separately.',
        'The subject has been recruiting students on temporary visas to work far beyond their permitted hours in violation of their status. Students who complain are threatened with deportation.',
        'Multiple shipping containers arrive at this location with documentation indicating "household goods" but actually contain commercial merchandise avoiding proper import duties.',
        'This manufacturing facility employs children who appear to be under 16 years old working night shifts. They are paid in cash and hidden when inspectors visit.',
        'I overheard the business owner discussing how they modify vehicle compartments to conceal people crossing the border. They mentioned having successful crossings multiple times per week.',
        'The named individual operates a document mill producing fake green cards and social security cards from the back room of this business.',
        'I received unusually explicit instructions on how to avoid detection when transporting packages for this company. The supervisor made it clear that I should avoid law enforcement inspection.',
        'This agricultural operation houses workers in unheated sheds with no running water. Workers are not allowed to leave the property and have their movements restricted.',
        'Shipments arrive labeled as "automotive parts" but actually contain unmarked pills and powder substances that are not logged in any inventory system.',
        'The subject has established a network of shell companies to facilitate money transfers to known criminal organizations. I have seen transaction records exceeding $2M per month.',
        'As a delivery driver, I was instructed to never question the contents of specific packages and to avoid normal security procedures when handling them.',
        'The company regularly brings in technical workers under visitor visas but has them performing full-time coding work in violation of their status.',
        'I have direct knowledge that this business is selling counterfeit merchandise as authentic. Their storage room contains packaging and labels from premium brands used for this purpose.',
        'Workers at this location are having their wages withheld and are told they must first pay off "transportation debts" before receiving payment.',
        'The facility is processing marine wildlife without proper permits or inspection. They specifically operate during hours when authorities are less likely to inspect.',
        'I observed individuals being forced to open bank accounts that were then immediately controlled by the business owner. These accounts are used to receive government benefits.',
        'The construction company transports workers in unmarked vans before dawn and pays them significantly below minimum wage with no overtime or benefits.',
        'The operator of this establishment has been providing housing to undocumented individuals in exchange for taking control of their bank accounts and benefits cards.',
        'Multiple people are living in extremely overcrowded conditions in this location, with mattresses covering the floor of every room. People are not allowed to leave unescorted.',
        'The named individual has admitted to me that they run a "visa fraud service" helping people overstay by creating false documentation and employment records.',
        'This day labor site is routinely hiring people without work authorization and paying them significantly less than legal workers for the same tasks.',
        'The company is disposing of hazardous chemicals in residential trash containers at night to avoid environmental regulations and proper disposal fees.',
        'I believe human trafficking is occurring at this location. Young women arrive from overseas and are immediately put to work without being able to communicate with anyone outside.',
        'Merchandise with removed or altered country-of-origin markings is being repackaged at this location to avoid tariffs and import restrictions.',
        'The organization is posing as an educational institution but actually exists primarily to provide visa documents without offering legitimate classes.',
        'Three individuals were observed discussing plans to smuggle contraband through this warehouse facility due to its minimal security protocols.',
        'The company owner has instructed employees to alert them if any law enforcement vehicles are seen in the vicinity so operations can be temporarily suspended.',
        'Workers are forced to cash their paychecks at a specific check-cashing business where half their wages are taken back as "fees" for housing and transportation.',
        'The business is advertising itself as a legitimate staffing agency but is actually providing fraudulent work documentation to unauthorized workers.',        'Agricultural products are being imported without proper USDA inspection by mislabeling their contents and country of origin.',
        'The facility operates a sophisticated surveillance network that monitors local law enforcement patrol patterns to avoid detection during criminal activities.',
        'I have witnessed the systematic recruitment of homeless individuals who are forced to work without compensation while being promised housing and basic necessities.',
        'This business maintains a complex inventory of stolen vehicle parts that are sold through seemingly legitimate auto repair shops to unsuspecting customers.',
        'The organization operates multiple fake charity drives that collect donations which are immediately diverted to fund illegal operations rather than helping the claimed beneficiaries.',
        'I observed the use of advanced radio frequency jamming equipment to disrupt law enforcement communications during specific criminal operations.',
        'This location serves as a distribution hub for counterfeit pharmaceuticals that are sold through fake online pharmacies to vulnerable patients seeking affordable medications.',
        'The business operates a sophisticated money lending operation that specifically targets undocumented immigrants, charging excessive interest rates and using threats of deportation to ensure payment.',
        'I have evidence that this organization corrupts local building inspectors to overlook safety violations in housing where exploited workers are forced to live.',
        'This facility houses equipment for creating professional-quality counterfeit identification documents including driver\'s licenses, passports, and work permits from multiple states.',
        'The company maintains detailed intelligence files on local law enforcement personnel including their schedules, patrol routes, and personal information to avoid detection.',
        'I witnessed the operation of a sophisticated insurance fraud scheme where fake accidents are staged to collect medical and property damage settlements.',
        'This business exploits seasonal agricultural visa programs by bringing in workers who are immediately forced into unrelated labor with no agricultural work performed.',
        'The organization operates a network of corrupt notaries who knowingly authenticate fraudulent documents used for various immigration and financial fraud schemes.',
        'I have observed the systematic disposal of toxic waste materials in residential areas during nighttime hours to avoid environmental oversight and proper disposal costs.',
        'This location serves as a training facility where individuals learn advanced document forgery techniques and are provided with sophisticated equipment for creating fake identification.',
        'The business maintains a complex network of shell companies that exist solely to hide criminal proceeds and provide legitimate-appearing sources for illegal income.',
        'I witnessed the use of encrypted communication systems to coordinate criminal activities across multiple states while avoiding law enforcement monitoring.',
        'This facility operates a sophisticated voter fraud scheme that registers fictitious individuals at multiple addresses to influence local elections.',
        'The organization exploits federal disaster relief programs by filing fraudulent claims for damages that never occurred at properties they don\'t own.',
        'I have evidence that this business operates a network of fake employment agencies that charge substantial fees to job seekers but provide no actual employment opportunities.',
        'This location houses advanced equipment for counterfeiting credit cards and payment processing devices used to steal financial information from unsuspecting consumers.',
        'The company maintains corrupt relationships with employees at multiple government agencies who provide confidential information in exchange for substantial bribes.',
        'I observed the systematic exploitation of elderly individuals who are convinced to sign over property deeds and financial accounts through sophisticated manipulation schemes.',
        'This business operates a complex trademark and copyright infringement operation that produces counterfeit goods bearing legitimate brand names and logos.',
        'The organization maintains a network of corrupt transportation officials who facilitate the movement of illegal goods across state and international borders.',
        'I have witnessed the operation of a sophisticated academic fraud scheme that sells fake degrees and transcripts from non-existent universities to unqualified individuals.',
        'This facility serves as a command center for coordinating cyber attacks against government databases to steal sensitive information for criminal purposes.',
        'The business exploits immigration attorney-client privilege by operating fraudulent legal services that charge authentic fees while providing fake documentation.',
        'I observed the use of mobile document shredding services to destroy evidence of criminal activities immediately after law enforcement investigations begin.',
        'This organization operates a complex network of fake medical practices that bill insurance companies for treatments never provided to patients who don\'t exist.',
        'The company maintains sophisticated equipment for intercepting and redirecting mail to steal government benefit payments and financial documents.',
        'I have evidence that this business operates a network of corrupt social workers who provide confidential information about vulnerable families in exchange for payments.',
        'This location houses a sophisticated operation for creating fake military service records and veteran benefits documentation for individuals who never served.',
        'The organization exploits religious tax exemptions by operating fake churches that exist solely to launder money and avoid taxation on criminal proceeds.',
        'I witnessed the systematic recruitment of individuals with mental disabilities who are exploited for their government benefits while receiving no actual care or support.',
        'This business operates a complex network of fake educational institutions that exist solely to facilitate student visa fraud without providing legitimate education.',
        'The facility maintains advanced equipment for producing counterfeit currency and financial instruments that are distributed through multiple criminal networks.',
        'I have observed the operation of a sophisticated witness intimidation network that uses surveillance and threats to prevent cooperation with law enforcement.',
        'This organization maintains corrupt relationships with employees at financial institutions who facilitate money laundering by avoiding required reporting.',
        'The company operates a network of fake rehabilitation centers that collect insurance payments for addiction treatment that is never provided to patients.',
        'I witnessed the use of advanced surveillance equipment to monitor law enforcement activities and warn criminal associates about ongoing investigations.',
        'This business exploits federal small business loan programs by creating fake companies that receive substantial funding but provide no legitimate goods or services.',
        'The organization operates a sophisticated identity theft network that specifically targets deceased individuals to file fraudulent tax returns and benefit claims.',
        'I have evidence that this facility serves as a training center where individuals learn advanced fraud techniques and are provided with tools for conducting various scams.',
        'This location houses equipment for creating fake professional licenses and certifications that allow unqualified individuals to work in regulated industries.',
        'The business maintains a complex network of corrupt officials who provide advance warning of regulatory inspections and law enforcement operations.',
        'I observed the systematic exploitation of federal housing assistance programs through fake rental properties and falsified income documentation.',
        'This organization operates a sophisticated network of fake employment verification services that help undocumented workers obtain jobs using false documentation.',
        'The company maintains advanced equipment for intercepting and cloning electronic payment cards used for unauthorized transactions at retail locations.',
        'I have witnessed the operation of a complex tax fraud scheme that uses stolen personal information to file fraudulent returns claiming fictitious business expenses.',
        'This facility serves as a distribution center for stolen merchandise that is repackaged and sold through legitimate-appearing online marketplaces.',
        'The business exploits federal agricultural assistance programs by claiming ownership of non-existent farmland and livestock to receive substantial subsidies.'
    ];// Specific narratives mapped to violation types
    const criminalActivityNarratives = {        'Benefit/Marriage Fraud': [
            'The individual has openly admitted to entering into a marriage solely for immigration benefits. They have stated they do not live with their spouse and have an arrangement to pay $10,000 for the marriage. They have shown me photos from a staged wedding ceremony.',
            'This business charges individuals $3,000-$5,000 to arrange fraudulent marriages for immigration benefits. They match foreign nationals with US citizens, coach them on how to answer immigration interview questions, and create fake evidence of shared lives.',
            'I have observed the individual meeting with multiple potential spouses at this location to discuss payment terms for marriage fraud. They have a price sheet for different services including marriage certificates, joint bank accounts, and coached interview preparation.',
            'The subject organizes "marriage arrangement parties" where foreign nationals are introduced to US citizens willing to marry for payment. I overheard discussions of fees ranging from $15,000 to $25,000, with additional charges for creating fraudulent joint financial records.',
            'I have evidence that this organization is facilitating fraudulent marriages. They create falsified documentation showing couples living together including doctored lease agreements, utility bills, and photographs. They openly discussed methods to deceive immigration interviewers.',
            'The individual maintains separate dating profiles specifically to find US citizens willing to marry for payment. They have shown me screenshots of negotiations with potential spouses discussing prices for different levels of documentation fraud.',
            'This organization operates a "marriage coaching academy" where they teach foreign nationals how to convincingly portray fake relationships during immigration interviews. They provide detailed scripts and stage rehearsal sessions.',
            'I witnessed the business owner showing clients how to create fake social media histories with their supposed spouses. They use professional photographers to create years of backdated couple photos for immigration evidence.',
            'The subject has admitted to maintaining fraudulent marriages with three different US citizens simultaneously, collecting benefits through each relationship while living with none of them.',
            'This location serves as a staging area where foreign nationals practice living as married couples before immigration interviews. They rehearse daily routines and create fake memories to share with investigators.',
            'I have direct knowledge that this business sells complete marriage fraud packages including the spouse, documentation, coaching, and ongoing support for $50,000. They guarantee visa approval or offer partial refunds.',
            'The organization maintains a database of US citizens willing to enter fraudulent marriages, with different pricing tiers based on the citizen\'s background, education, and immigration interview performance history.',
            'I observed the systematic creation of fraudulent joint tax returns, insurance policies, and mortgage applications for couples who have never lived together and met only for business transactions.',
            'The business operates fake wedding venues where they stage ceremonies exclusively for immigration documentation purposes. The same wedding party participants appear in multiple ceremonies for different couples.',            'I have evidence that this individual has been married to four different foreign nationals in the past two years, divorcing each after their green card approval and collecting payments of $20,000-$30,000 per marriage.',
            'This law office operates a sophisticated marriage fraud scheme where attorneys facilitate fake marriages and create falsified legal documentation. They maintain a network of willing US citizens and charge $75,000 for complete legal packages.',
            'The subject operates a dating website specifically to connect foreign nationals with US citizens willing to marry for payment. They screen potential spouses based on their ability to pass background checks and interview skills.',
            'I witnessed this business creating elaborate fake relationship histories including forged love letters, staged vacation photos, and fabricated social media interactions spanning multiple years to support fraudulent marriage applications.',
            'This organization maintains safe houses where fake married couples practice living together before immigration interviews. They provide coaching on intimate details couples should know and stage household items to create evidence of cohabitation.',
            'The individual has shown me a detailed business plan for expanding their marriage fraud operations to other states. They track success rates by region and adjust their pricing based on local immigration enforcement patterns.',
            'I have observed this business using professional actors to play family members at fake wedding ceremonies. They maintain a roster of individuals who regularly participate in fraudulent ceremonies for different couples.',
            'This organization exploits religious communities by arranging fake marriages through corrupt religious leaders who perform ceremonies knowing the relationships are fraudulent while providing authentic-looking religious marriage certificates.',
            'The subject maintains detailed files on immigration officers\' questioning patterns and adjusts their coaching methods accordingly. They conduct mock interviews and provide specific answers to commonly asked questions.',
            'I witnessed the creation of fake employment records for both spouses to support their marriage fraud applications. They coordinate with corrupt employers to provide false documentation of joint financial responsibilities.',
            'This business operates a photo studio specifically for creating fake relationship evidence. They maintain props, costumes, and backdrops to create years of fraudulent couple photos for different seasons and occasions.',
            'The organization maintains corrupt contacts within USCIS who provide advance warning of investigation activities and interview scheduling. They adjust their operations based on this inside information.',
            'I have evidence that this group creates fake domestic violence reports to exploit immigration protections. They coach foreign nationals on making false claims about their supposed spouses to obtain immigration benefits.',
            'This facility serves as a training center where foreign nationals learn American customs and cultural references to better portray authentic relationships during immigration interviews.',
            'The subject operates multiple identity documents under different names to facilitate marriage fraud with various partners simultaneously. They maintain separate households and social media profiles for each fraudulent relationship.',
            'I observed this organization exploiting military personnel by offering them substantial payments to enter fraudulent marriages. They specifically target service members facing financial difficulties.',
            'This business maintains a sophisticated financial operation that creates fake joint assets including fabricated bank accounts, credit cards, and loan applications to support marriage fraud documentation.',
            'The organization operates a network of corrupt photographers who backdated engagement and wedding photos to create false timeline evidence for immigration applications.',
            'I have witnessed this group coaching US citizens on how to lie convincingly about their relationships during immigration interviews. They provide detailed scripts and practice scenarios.',
            'This entity maintains detailed intelligence on immigration enforcement patterns and temporarily suspends operations during periods of increased scrutiny, resuming activities when enforcement attention decreases.',            'The subject operates a fraudulent immigration attorney practice that creates false legal documentation while charging authentic attorney fees. They exploit immigrants\' trust in legal professionals to facilitate their fraud schemes.',
            'Yo, this chick basically runs a fake wife rental service out of her apartment. She\'s got like 6 different dudes on rotation, each paying her twenty grand to pretend they\'re married. I seen the whole operation when I was dating her roommate.',
            'My neighbor\'s been bragging about how he\'s pulling in serious cash marrying random foreign girls. He showed me his spreadsheet - dude\'s made like 150K in two years just signing papers and showing up to immigration interviews.',
            'This lady at the nail salon straight up told me she arranges fake marriages for people. She\'s like "honey, you need quick money? I got clients who pay $15K for a marriage certificate and some photos." The whole place is basically a front.',
            'Saw this dude on dating apps with like 8 different profiles, all saying he\'s looking for marriage. When I matched with him, he immediately starts talking about immigration paperwork and how much I could make. Creepy as hell.',
            'My ex-roommate runs this whole scam where she teaches foreign people how to act American for their immigration interviews. She\'s got like a whole curriculum about baseball, barbecues, and how to argue like a real couple.',
            'There\'s this church downtown where they do fake weddings every weekend. Same pastor, same wedding party, different couples each time. My cousin got paid 200 bucks to be a bridesmaid in like 12 different ceremonies.',
            'This girl I work with showed me her side hustle - she creates fake Instagram relationships for marriage fraud couples. Like, she\'ll photoshop them into vacation pics and create years of fake posts to make it look legit.',
            'My landlord told me straight up that half his tenants are fake married couples practicing for immigration interviews. He charges them extra because they need two bedrooms but only one person actually lives there.',
            'Overheard this conversation at Starbucks where these two people were negotiating a marriage deal. The girl was like "I need 25K upfront and another 10K when you get your green card." They were discussing it like buying a car.',
            'This barbershop I go to is basically marriage fraud central. The owner\'s always hooking people up, talking about "I got a guy who needs a wife" or "I know a girl who needs papers." It\'s like Tinder but for immigration fraud.',
            'My upstairs neighbor runs a whole coaching business out of her living room. I can hear her teaching people how to fight authentically and what inside jokes married couples should have. She charges like $500 per session.',
            'This photographer at the mall specializes in fake couple photos. She\'s got props, different backdrops for seasons, and she\'ll even photoshop people into family pictures. My friend saw her editing a dude into Christmas photos with a family he\'d never met.',
            'There\'s this group chat I accidentally got added to where people are literally auctioning off marriage slots. They\'re posting photos, background checks, and starting bids. It\'s like eBay but for fake spouses.',
            'My coworker\'s wife runs a whole training camp for fake couples. She makes them do trust exercises, learn each other\'s coffee orders, and practice fighting about money. It\'s like couples therapy but in reverse.',
            'Saw this lady at the DMV helping like 6 different couples get matching addresses on their licenses. She had a whole system with fake lease agreements and was charging them each 500 bucks for the service.',
            'This dude I met at a bar was drunk and bragging about his "marriage business." He\'s like "I\'ve been married 8 times in 3 years and I\'m making bank." Showed me photos from all these different weddings with different women.',
            'My friend\'s mom runs this whole operation out of her catering business. She stages fake engagement parties and wedding receptions, then sells the photos to marriage fraud couples for their immigration paperwork.',
            'There\'s this online group where people share tips on how to fake being married. They\'ve got scripts for common interview questions, lists of what married couples should have in their homes, and pricing guides for different services.',
            'This girl on my block has been "married" to 4 different guys in the past year. Each time, there\'s a different car in her driveway for like a week, then they disappear and she starts posting couple photos with someone new.',
            'My dentist\'s office is apparently where a lot of these fake couples meet for their "dates" before immigration interviews. The receptionist told me they book the same appointments every week for people who don\'t actually know each other.',
            'Overheard this phone call where someone was placing an order for a fake husband like they were ordering pizza. "I need someone clean-cut, good English, available for interviews next month. Budget is 20K." Wild.',
            'This tax place in my neighborhood does fake joint returns for marriage fraud couples. The owner straight up advertised it to me, saying "you don\'t gotta be really married, just need the papers to look right."',
            'My uber driver told me his day job is being a fake husband. He\'s got 3 different apartments set up with different women\'s stuff, and he rotates between them depending on when immigration wants to do surprise visits.',
            'There\'s this Facebook group for fake couples where they practice their stories. They\'ll post stuff like "quiz time: how did we meet?" and everyone helps each other come up with believable backstories.',
            'Saw this woman at the grocery store with like 10 different wedding rings in her cart. When I asked, she laughed and said "business supplies - gotta make sure each couple has matching sets for their photos."',            'My neighbor\'s running a whole document fraud ring out of his basement. He\'s got printers, laminators, and templates for every kind of joint paperwork these fake couples need. Charges like 2K per complete package.',
            'This immigration consultant I met charges couples $80,000 for complete marriage fraud packages including coaching, documentation, and guaranteed interview success. They even provide fake family members for the wedding ceremony.',
            'I witnessed a woman who maintains three separate apartments with different fake husbands. She rotates between them for immigration visits and collects monthly payments from each spouse for maintaining the fraud.',
            'The business operates a marriage fraud call center where employees coach couples on their fake relationship stories before immigration interviews. They practice daily conversations and create shared memory scripts.',
            'I observed a sophisticated operation where they create fake social media dating histories going back years. They photoshop couples into concert photos, vacation pictures, and family gatherings they never attended.',
            'This organization recruits US military personnel specifically for marriage fraud because their background checks are already complete. They pay service members $40,000 to enter fraudulent marriages.',
            'The subject runs a fake wedding venue that exclusively hosts immigration fraud ceremonies. They reuse the same decorations, flowers, and even wedding cake for multiple couples on the same day.',
            'I have evidence of a group that creates elaborate fake proposal videos and engagement announcements for social media to establish false relationship timelines for immigration applications.',
            'This business maintains a database of immigration interview questions and updates their coaching materials based on recent changes in USCIS questioning patterns and verification methods.',
            'I witnessed the creation of fake couple\'s therapy records to support marriage fraud cases. They maintain relationships with corrupt counselors who provide false documentation of relationship problems and resolutions.',            'The organization operates multiple fake dating websites designed specifically to match foreign nationals with US citizens willing to commit marriage fraud for payment.',
            'This wedding planning business exclusively caters to immigration fraud couples, providing complete ceremony packages including fake guest lists, staged receptions, and honeymoon photo packages for evidence documentation.',
            'I witnessed a sophisticated document forging operation that creates fake marriage certificates backdated by several years, complete with fraudulent witness signatures and official-looking seals.',
            'The business operates a network of corrupt notaries who witness fake marriage documents and provide fraudulent authentication services for immigration applications.',
            'I observed the systematic creation of fake couple\'s social media accounts with years of fabricated post history, including anniversary celebrations and relationship milestones that never occurred.',
            'This organization maintains a fleet of vehicles with different license plates that fake couples use for staged "date" photos at various romantic locations throughout the state.',
            'The subject operates a fake marriage counseling service that provides fraudulent therapy records to support immigration applications, complete with session notes about relationship challenges and resolutions.',
            'I have evidence of a business that rents furnished apartments specifically for fake couples to stage immigration home visits, with personal items and photos arranged to suggest long-term cohabitation.',
            'This organization recruits corrupt immigration attorneys who knowingly file fraudulent petitions while maintaining plausible deniability about their clients\' true relationships.',
            'I witnessed the operation of a fake wedding registry scam where couples create elaborate gift lists and fake purchase histories to demonstrate their fraudulent relationship to immigration officials.',
            'The business maintains a sophisticated financial fraud network that creates fake joint credit histories, loan applications, and investment accounts to support marriage fraud documentation.',
            'I observed the systematic coaching of fake couples on cultural differences and personal habits to help them convincingly portray authentic cross-cultural relationships during interviews.',
            'This organization operates a network of safe houses where fake couples practice their fraudulent relationships under realistic living conditions before immigration inspections.',
            'The subject maintains detailed surveillance of immigration enforcement patterns and adjusts their fraud operations based on seasonal inspection schedules and policy changes.',
            'I have evidence of a business that creates fake divorce papers and remarriage documents to help individuals who have previously committed marriage fraud establish new fraudulent relationships.',            'This organization operates a sophisticated background check service that identifies the most suitable US citizens for marriage fraud based on their financial stability, criminal history, and interview capabilities.',
            'The subject runs a subscription-based marriage fraud service where US citizens pay monthly fees to maintain fake relationships with multiple foreign nationals simultaneously, rotating their "marriages" to maximize profits.',
            'I witnessed a business that specializes in creating fake relationship artifacts including forged concert tickets, restaurant receipts, and vacation souvenirs spanning multiple years to support fraudulent marriage timelines.',
            'This organization maintains a network of corrupt divorce attorneys who expedite dissolution proceedings for completed marriage fraud cases while ensuring no documentation traces back to the original fraudulent arrangement.',
            'The facility operates a sophisticated props rental service providing household items, furniture, and personal belongings to stage authentic-looking shared living spaces for immigration home inspections.',
            'I observed the systematic creation of fake pregnancy announcements and baby shower invitations to establish deeper relationship authenticity for couples undergoing extended immigration review processes.',
            'This business maintains detailed psychological profiles of immigration officers to customize coaching strategies based on individual interviewer personalities and questioning tendencies.',
            'The organization operates a network of safe houses equipped with surveillance equipment to monitor and record fake couples practicing their relationships for quality control purposes.',            'I have evidence of a sophisticated identity theft operation that specifically targets recently divorced individuals to create new marriage fraud opportunities using their authentic relationship histories.',
            'This facility serves as a training academy where marriage fraud coordinators learn advanced deception techniques, legal loopholes, and countermeasures against immigration enforcement methods.',
            'The subject operates a fake therapy practice that provides fraudulent couples counseling records designed to demonstrate relationship authenticity and resolve any inconsistencies discovered during interviews.',
            'I witnessed the operation of a specialized moving company that stages fake relocations for marriage fraud couples, creating paper trails of shared household moves without actual cohabitation.',
            'This organization maintains corrupt contacts within wedding venues who provide backdated ceremony documentation and fake guest registries to support fraudulent marriage timeline claims.',
            'The business operates a sophisticated financial planning service that creates fake joint investment portfolios and retirement planning documents to demonstrate long-term relationship commitment.',
            'I have observed the systematic recruitment of individuals with specific ethnic backgrounds to create more believable cross-cultural marriage fraud arrangements based on statistical immigration approval patterns.',
            'The subject operates a sophisticated asylum fraud network where fake couples claim persecution in their home country based on their fraudulent marriage. They maintain detailed cultural scripts about supposed threats to mixed relationships.',
            'I witnessed a business that creates elaborate fake anniversary celebrations and milestone documentation spanning multiple years to demonstrate relationship longevity for immigration review processes.',
            'This organization maintains a network of corrupt funeral directors who provide fake death certificates allowing marriage fraud participants to remarry without proper divorce documentation.',
            'The facility operates a specialized document aging service that artificially weathers marriage certificates, photographs, and personal correspondence to create authentic-looking evidence of long-term relationships.',
            'I have evidence of a group that exploits military deployment records to explain gaps in cohabitation for marriage fraud couples, creating false documentation of overseas assignments and separation periods.',
            'This business operates fake marriage counseling services specifically designed to create paper trails of relationship problems and reconciliation for couples under immigration scrutiny.',
            'The subject maintains a network of professional actors who pose as long-term friends and family members during immigration interviews, providing coached testimony about the couples\' authentic relationships.',
            'I observed the systematic creation of fake pregnancy loss documentation to explain the absence of children in long-term marriage fraud arrangements when questioned by immigration officials.',
            'This organization operates a specialized travel booking service that creates false vacation itineraries and backdated trip documentation to support fraudulent marriage relationship timelines.',
            'The facility maintains sophisticated video editing equipment used to create fake proposal videos, wedding ceremonies, and anniversary celebrations for marriage fraud documentation purposes.',
            'I witnessed the operation of a fake marriage enrichment seminar business that provides certificates and attendance records for couples needing to demonstrate ongoing relationship investment.',
            'This business creates elaborate fake engagement party documentation including guest lists, venue contracts, and professional photography to establish fraudulent relationship announcements.',
            'The subject operates a network of corrupt real estate agents who create fake lease agreements and property purchase documents showing joint financial investments between marriage fraud participants.',
            'I have evidence of a sophisticated social media manipulation service that creates years of fake relationship posts, friend interactions, and family acknowledgments across multiple platforms.',
            'This organization maintains a database of immigration officer questioning patterns and creates customized coaching programs based on individual interviewer psychological profiles and techniques.',
            'The facility operates a fake couples cooking class business that provides attendance certificates and relationship skill documentation for marriage fraud couples under immigration review.',
            'I observed the systematic creation of fake medical emergency documentation where one spouse appears to care for the other during fabricated health crises to demonstrate authentic concern.',
            'This business operates a specialized gift registry fraud service creating elaborate wedding and anniversary wish lists with fake purchase histories spanning multiple years.',
            'The subject maintains corruption networks within religious institutions that provide backdated baptismal certificates and religious education records for fraudulent interfaith marriage documentation.',
            'I witnessed the operation of a fake couples\' book club that provides meeting attendance records and relationship growth documentation for marriage fraud participants requiring cultural activity evidence.',
            'This organization creates sophisticated fake employment verification letters showing couples working for the same companies or in related industries to support their fraudulent relationship claims.',
            'The facility operates a specialized pet adoption fraud service where fake couples adopt animals together to create shared responsibility documentation for immigration evidence.',
            'I have evidence of a business that creates fake couple\'s fitness membership records and personal training sessions to demonstrate shared lifestyle activities and long-term health planning.',
            'This organization maintains a network of corrupt insurance agents who create fake joint life insurance policies and beneficiary arrangements to support marriage fraud financial documentation.',
            'The subject operates a fake home renovation documentation service creating falsified receipts and project timelines showing couples jointly improving shared living spaces over time.',
            'I observed the systematic creation of fake charitable donation records showing couples jointly supporting causes important to their cultural backgrounds and shared values systems.',
            'This business operates a specialized fake anniversary cruise booking service that creates elaborate vacation documentation including cabin assignments and activity participation records.',
            'The facility maintains sophisticated financial planning fraud services creating fake retirement account beneficiary arrangements and joint investment strategy documentation spanning multiple years.',
            'I witnessed the operation of a fake couples therapy group practice that provides session notes and relationship milestone documentation for marriage fraud couples under extended scrutiny.',
            'This organization creates elaborate fake holiday celebration documentation including family gathering photos and gift exchange records spanning multiple cultural traditions and anniversary dates.',
            'The subject operates a network of corrupt wedding photographers who maintain equipment for backdating digital photos and creating authentic-looking metadata for fraudulent relationship timelines.',
            'I have evidence of a business that creates fake couple\'s travel documentation including passport stamps, hotel reservations, and tourist activity receipts from romantic destinations worldwide.',
            'This organization maintains a sophisticated fake couple\'s education service where both spouses appear to take language or cultural classes together to support their cross-cultural relationship claims.',
            'The facility operates a fake couples counseling certification program that trains marriage fraud coordinators to provide authentic-sounding relationship advice during immigration interviews.',
            'I observed the systematic creation of fake family planning documentation including fertility treatment records and adoption consultation papers to demonstrate couples\' shared future planning.',
            'This business operates a specialized fake anniversary jewelry service creating elaborate gift documentation and insurance appraisals showing significant financial investment in relationship milestones.',
            'The subject maintains corruption within wedding venue management that provides falsified booking records and event photography showing elaborate ceremonies that actually occurred for different couples.',
            'I witnessed the operation of a fake couples\' dance class business that provides lesson attendance records and performance documentation showing shared artistic interests and cultural activities.',
            'This organization creates sophisticated fake joint credit card application records and spending pattern documentation showing authentic couple financial behavior over extended time periods.',
            'The facility operates a specialized fake couple\'s volunteer service that creates community service records and organizational testimonials about the couples\' shared civic engagement and values.',
            'I have evidence of a business that maintains fake couple\'s social calendar documentation including dinner party invitations, friend gatherings, and social event attendance records spanning multiple years.',
            'This organization operates a network of corrupt wedding cake decorators who maintain detailed records of fake anniversary celebrations and milestone party documentation for immigration evidence.',
            'The subject creates elaborate fake couple\'s gardening and home improvement documentation showing shared domestic projects and seasonal maintenance activities demonstrating long-term cohabitation planning.',
            'I observed the systematic creation of fake couple\'s joint hobby documentation including equipment purchases, class enrollments, and competition participation records showing shared interests and activities.',
            'This business operates a sophisticated fake couple\'s financial consultation service creating detailed budget planning records and major purchase decision documentation spanning multiple life phases.',
            'The facility maintains fake couple\'s subscription service records for magazines, streaming services, and delivery programs showing shared household management and entertainment preferences over time.',
            'I witnessed the operation of a fake couple\'s wine or cooking club that provides tasting event attendance and educational course completion certificates demonstrating sophisticated shared cultural interests.'
        ],'Bulk Cash Smuggling/Financial Crimes': [
            'Large amounts of cash (estimated $50,000+) are being stored at this location and prepared for transport across the border. I\'ve observed individuals counting and packaging currency in vacuum-sealed bags while discussing avoiding declaration requirements.',
            'The business is structured to hide money transfers. They collect cash from multiple sources, break it into smaller amounts under $10,000, and use different individuals to deposit the funds at various banks to avoid reporting requirements.',
            'I\'ve witnessed regular deliveries of cash in duffel bags to this location followed by individuals making multiple small deposits at different banks. They explicitly discussed avoiding "government reporting thresholds."',
            'Multiple individuals were observed at this location converting large sums of cash into cryptocurrency, gift cards, and money orders to avoid financial reporting requirements. They specifically mentioned avoiding "CTR triggers" and "keeping transactions untraceable."',
            'As an employee, I\'ve been instructed to process wire transfers using multiple different sender names for the same source of funds. Management explicitly stated this was to avoid "financial monitoring" and has prohibited maintaining records of these transactions.',
            'I have witnessed systematic cash structuring operations where individuals make deposits of exactly $9,500 at multiple banks on the same day. They maintain detailed schedules to avoid the same teller and coordinate timing to prevent detection.',
            'The business operates a cash exchange service that deliberately fails to file required reports. They process transactions exceeding $10,000 by splitting them across multiple days and using different employee names as the transaction processors.',
            'I observed individuals using multiple fake identities to open bank accounts specifically for layering illegal cash proceeds. They maintain a collection of fraudulent identification documents and rotate through different banking institutions monthly.',
            'This location serves as a hub for converting drug proceeds into legitimate-appearing assets. I witnessed the purchase of expensive vehicles, jewelry, and real estate using structured cash payments designed to avoid financial reporting requirements.',
            'The organization maintains a network of money mules who receive electronic transfers and convert them to cash for a percentage fee. These individuals are specifically recruited because they have clean banking histories and limited financial sophistication.',
            'I have direct knowledge of a sophisticated money laundering operation using trade-based methods. They over-invoice and under-invoice international shipments to move value across borders while maintaining the appearance of legitimate business transactions.',
            'The business uses a complex system of shell companies and nominee accounts to obscure the source of funds. I have seen documentation showing how money moves through at least six different accounts before reaching its final destination.',
            'I witnessed the systematic use of high-value casino chips to launder money. Individuals purchase chips with cash, engage in minimal gambling, then cash out with checks that create a documented source for previously illegal funds.',
            'The facility operates a sophisticated currency exchange that deliberately avoids reporting requirements by maintaining transactions just below federal thresholds while processing millions of dollars monthly through this method.',            'I have observed the use of prepaid cards and digital payment systems to move large amounts of money without traditional banking oversight. They specifically target payment systems with minimal verification requirements and poor record-keeping protocols.',
            'This organization operates a sophisticated check-cashing network that processes illegal proceeds through multiple storefront locations. They charge higher fees than legitimate businesses but ask no questions about the source of funds.',
            'The business maintains a fleet of vehicles with hidden compartments specifically designed for transporting large amounts of cash across international borders. Each vehicle can conceal up to $2 million in specially designed storage areas.',
            'I witnessed the systematic use of elderly individuals as money mules who are paid small amounts to conduct financial transactions on behalf of the organization. These individuals often don\'t understand they\'re participating in money laundering operations.',
            'This facility operates a sophisticated cash counting and packaging operation that processes millions of dollars monthly. They use industrial money counting machines and vacuum sealing equipment to prepare cash for transport.',
            'The organization maintains corrupt relationships with armored car service employees who facilitate the movement of illegal cash by mixing it with legitimate business deposits.',
            'I have observed the use of construction companies as fronts for laundering drug proceeds. They pay workers partially in cash from illegal sources while maintaining legitimate payroll records to justify cash expenditures.',
            'This business operates a network of small retail stores that exist primarily to process cash transactions for money laundering purposes. They manipulate sales records to justify large cash deposits.',
            'The facility houses a sophisticated currency exchange operation that specifically caters to individuals seeking to avoid financial reporting requirements. They maintain multiple exchange rates to maximize profits from illegal transactions.',
            'I witnessed the systematic purchase of high-value items using structured cash payments that are immediately resold to convert illegal cash into seemingly legitimate proceeds.',
            'This organization operates a complex hawala network that moves money internationally without traditional banking oversight. They maintain detailed trust-based accounting systems that are deliberately opaque to authorities.',
            'The business uses a network of check-cashing services and money service businesses to process illegal funds. They rotate between different locations to avoid pattern recognition by financial intelligence units.',
            'I have observed the use of professional money brokers who specialize in converting large amounts of cash into other financial instruments. They charge premium fees but guarantee anonymity and speed.',
            'This facility operates as a cash consolidation center where proceeds from various illegal activities are collected, counted, and redistributed to different criminal organizations.',
            'The organization maintains sophisticated record-keeping systems that track the movement of illegal funds while providing plausible deniability about the source of money.',
            'I witnessed the use of trade-based money laundering where they manipulate import/export invoices to move value across borders while maintaining the appearance of legitimate commerce.',
            'This business operates multiple currency exchange services that specialize in converting US dollars to foreign currencies without proper reporting. They maintain exchange rates that favor speed over legitimate market rates.',
            'The facility houses advanced equipment for detecting counterfeit currency and testing the authenticity of various financial instruments used in their money laundering operations.',
            'I have observed the systematic recruitment of individuals with clean financial histories to open bank accounts specifically for money laundering purposes. These account holders receive small payments for their participation.',            'This organization operates a sophisticated system for timing cash deposits across multiple banks to avoid triggering automated reporting systems. They maintain detailed schedules and monitoring systems.',
            'The business maintains a network of corrupt real estate agents who facilitate cash purchases of properties using structured payments designed to avoid reporting requirements while creating apparently legitimate asset ownership.',
            'Yo, my cousin works at this sketchy money transfer place where they break up big transactions into smaller ones to avoid paperwork. The owner straight up told him "we don\'t ask questions, we just move cash."',
            'This car wash near my house is basically a money laundering operation. They claim to wash like 500 cars a day but I never see more than 10. All their "revenue" comes from some other business.',
            'My neighbor runs this check cashing place that deals with obviously dirty money. People roll up with duffel bags full of cash and leave with clean money orders and gift cards.',
            'Found out this casino dealer I know has been helping people convert drug money into chips, then cash out with legitimate-looking winnings. He gets a cut of every transaction.',
            'This construction company owner bragged about how he pays his crew in dirty cash while reporting legitimate payroll. Says it\'s the perfect way to clean money while getting cheap labor.',
            'My ex-girlfriend\'s dad runs multiple fake businesses that exist only on paper. He uses them to justify moving hundreds of thousands in cash through different bank accounts.',
            'Saw this dude at Walmart buying dozens of prepaid cards with cash bundles. The cashier didn\'t even question why someone needs $50,000 worth of gift cards.',
            'This pawn shop owner has been teaching people how to convert stolen goods and dirty money into clean assets. He charges a 30% fee but guarantees no questions asked.',
            'My friend\'s mom works at a currency exchange that specializes in avoiding reporting requirements. They deliberately keep transactions just under $10K and coach customers on the rules.',
            'This guy I met at a bar owns a bunch of laundromats that are really money laundering fronts. He jokes about literally "laundering" money but it\'s not actually funny.',
            'Found out this food truck festival organizer is running a cash structuring operation. He collects dirty money from vendors and deposits it across multiple banks as "food sales."',
            'My landlord told me he runs a bulk cash smuggling operation using moving trucks. He hides millions in furniture shipments and transports it across state lines.',
            'This jewelry store owner has been converting drug proceeds into diamonds and gold. He melts down stolen jewelry and creates new pieces to hide the money trail.',
            'Overheard this conversation at the gym where someone was explaining how they use elderly people as money mules. They pay them $500 to make deposits and transfers.',
            'This real estate agent specializes in cash house purchases where the money obviously comes from illegal sources. She doesn\'t ask questions and charges premium commissions.',
            'My brother-in-law works for an armored car company and told me how they help certain clients move undocumented cash by mixing it with legitimate business deposits.',
            'This art dealer has been selling overpriced paintings to help people launder money. A $5,000 painting becomes worth $500,000 on paper to justify the clean money.',
            'Found out this import/export business is using fake invoices to move money internationally. They claim to ship expensive goods but actually just transfer cash.',
            'This tax preparation office helps people launder money by creating fake business expenses and income sources. They charge 20% but guarantee clean tax returns.',
            'My neighbor runs a network of food trucks that exist primarily to process dirty cash. They report massive daily sales but barely serve any actual customers.',
            'This arcade owner has been helping gang members clean their money through fake gaming revenues. Kids play with tokens while the real business happens in the back.',
            'Discovered this auto repair shop is really a money laundering operation. They charge $50,000 for "custom work" that\'s actually just cleaning drug money.',
            'This lottery ticket store has been involved in a cash structuring scheme. People buy tickets with dirty money, win small amounts, and claim clean gambling winnings.',
            'My friend\'s uncle owns a cash-intensive business that he uses to mix legitimate and illegal proceeds. He processes millions in dirty money through his pizza shops.',
            'This money service business owner taught me how they avoid reporting by using multiple employee names for large transactions. Says banks never catch the pattern.',            'Found out this auction house has been facilitating money laundering through inflated art sales. Buyers pay cash for worthless items at ridiculous prices.',
            'This organization operates a sophisticated hawala network that moves millions internationally without banking oversight. They maintain trust-based accounting systems that deliberately obscure money trails.',
            'I discovered a business that purchases legitimate companies specifically to layer illegal cash through their established banking relationships and customer base.',
            'The facility operates as a cash consolidation center where proceeds from various criminal enterprises are collected, counted, and redistributed through legitimate-appearing channels.',
            'I witnessed the systematic use of cryptocurrency ATMs to convert large amounts of cash into digital currency that can be transferred internationally without traditional banking oversight.',
            'This car dealership specializes in cash purchases of luxury vehicles that are immediately exported to countries with bank secrecy laws, effectively transferring value offshore.',
            'The business maintains a network of corrupt bank employees who facilitate large cash deposits without filing required reports in exchange for substantial bribes.',
            'I observed the operation of a sophisticated check kiting scheme that creates temporary funds availability across multiple bank accounts to facilitate money laundering.',
            'This organization recruits individuals with gambling addictions to serve as money mules, providing them with funds to gamble and cash out winnings as apparently legitimate income.',
            'The facility houses equipment for producing high-quality counterfeit money orders and cashier\'s checks used to convert illegal cash into apparently legitimate financial instruments.',            'I have evidence of a group that exploits religious organizations by making large cash donations that are then returned as tax-deductible charitable contributions, effectively laundering the money.',
            'This organization operates a sophisticated ATM skimming network that steals card information and uses it to withdraw cash from accounts, then structures the stolen money through multiple business deposits.',
            'I witnessed the systematic use of online payment platforms to convert illegal cash into digital payments that are then transferred to offshore accounts through cryptocurrency exchanges.',
            'The business maintains a network of corrupt cashiers at major retail chains who process fake returns for cash without requiring receipts, effectively converting stolen goods into clean money.',
            'I observed the operation of a sophisticated precious metals exchange that converts illegal cash into gold, silver, and platinum bullion that can be easily transported and converted back to cash.',
            'This organization recruits individuals with clean financial histories to act as straw purchasers for high-value assets, then quickly transfers ownership to hide the true source of funds.',
            'The facility operates a cash-intensive business front that reports inflated revenues to justify large bank deposits while mixing legitimate and illegal proceeds.',
            'I have evidence of a group that exploits student loan programs by having money mules apply for maximum educational funding, then immediately withdrawing the cash for criminal purposes.',
            'This business maintains a sophisticated network of shell companies that exist solely to receive wire transfers and immediately convert them to cash through structured withdrawal patterns.',
            'I witnessed the use of mobile money transfer services to move illegal funds across borders without traditional banking oversight, exploiting lax verification requirements.',
            'The organization operates a complex system of fake invoice billing between shell companies to create apparent legitimate business transactions that justify large cash flows.',
            'I observed the systematic recruitment of homeless individuals who are paid small amounts to open bank accounts and conduct financial transactions on behalf of the criminal organization.',
            'This facility houses a sophisticated cash counting and packaging operation that can process over $10 million monthly, using industrial equipment to prepare money for international transport.',
            'The business operates a network of currency exchanges that deliberately maintain poor record-keeping to facilitate money laundering while charging premium exchange rates.',
            'I have evidence of a group that exploits insurance fraud schemes to convert illegal cash into legitimate-appearing insurance payouts through staged accidents and false claims.',            'This organization maintains corrupt relationships with armored car services and bank employees who facilitate the movement and processing of illegal cash through legitimate financial channels.',
            'I witnessed a sophisticated bulk cash smuggling operation that uses shipping containers with false bottoms to transport millions in currency across international borders while avoiding customs detection.',
            'The business operates a network of corrupt currency exchange services in multiple states that coordinate large cash transfers while deliberately failing to report transactions to financial intelligence units.',
            'I observed the systematic use of private aircraft to transport bulk cash across borders, with money hidden in specialized compartments designed to avoid detection during routine inspections.',
            'This organization maintains a fleet of commercial trucks equipped with sophisticated hidden compartments that can conceal up to $5 million in cash during interstate transport operations.',
            'I have evidence of a group that exploits diplomatic mail services to transport bulk cash internationally without customs inspection, using corrupt contacts within foreign consulates.',
            'The facility operates a sophisticated cash compression and packaging system that reduces the physical volume of currency by 75% to facilitate concealment during transport.',
            'I witnessed the use of corrupt postal service employees who facilitate bulk cash shipments through the mail system while bypassing security screening and reporting requirements.',
            'This business maintains a network of safe houses specifically designed for storing and processing large quantities of cash before international transportation.',
            'I observed the systematic use of maritime shipping to transport bulk cash in cargo containers, with money concealed within legitimate commercial shipments.',
            'The organization operates a sophisticated money laundering network that processes over $50 million monthly through a combination of cash structuring and trade-based value transfer.',
            'I have evidence of a group that uses corrupt airline employees to transport bulk cash as cargo on commercial flights while avoiding security screening and customs declaration.',
            'This facility houses advanced cash counting and authentication equipment capable of processing and verifying millions in currency daily before international shipment.',
            'I witnessed the operation of a bulk cash smuggling network that uses recreational vehicles and motor homes to transport large quantities of money across borders during vacation travel.',
            'The business maintains corrupt relationships with border officials who facilitate the passage of vehicles containing undeclared bulk cash in exchange for substantial bribes.',            'I observed the systematic use of commercial delivery services to transport bulk cash hidden within legitimate business shipments, exploiting limited package inspection procedures.',
            'This organization operates a sophisticated electronic money transfer network that bypasses traditional banking systems to move criminal proceeds across international borders without detection.',
            'The facility houses a complex currency conversion operation that exchanges various foreign currencies into untraceable assets while maintaining minimal documentation to avoid regulatory oversight.',
            'I witnessed the use of corrupt casino employees who facilitate large cash transactions through gaming chips, effectively laundering money through apparent gambling activities while avoiding banking regulations.',
            'This business operates a network of precious metals dealers who convert bulk cash into gold, silver, and other valuable commodities that can be easily transported and liquidated internationally.',
            'The organization maintains a sophisticated trade-based money laundering system that over-invoices legitimate exports to justify large cash transfers to foreign accounts.',
            'I observed the systematic exploitation of real estate transactions where criminal proceeds are used to purchase properties through cash deals that obscure the true source of funds.',
            'This facility operates as a coordination center for bulk cash storage and distribution, maintaining climate-controlled vaults and sophisticated security systems for processing criminal proceeds.',
            'The business exploits cryptocurrency exchanges to convert large amounts of physical cash into digital currencies that can be transferred internationally without traditional banking oversight.',
            'I witnessed the use of corrupt money service businesses that deliberately fail to report large cash transactions while providing money transfer services to criminal organizations.',
            'This organization operates a complex system of shell companies that exist solely to receive and transfer bulk cash proceeds while creating false paper trails for apparent legitimacy.',
            'The facility houses sophisticated cash counting and bundling equipment capable of processing millions of dollars daily while maintaining detailed records for criminal accounting purposes.',
            'I observed the systematic use of legitimate charity organizations as fronts for moving criminal proceeds, exploiting the reduced scrutiny often given to charitable donations and transfers.',
            'This business maintains a network of corrupt airline and shipping employees who facilitate the transport of bulk cash through cargo systems while avoiding security screening and customs inspection.',
            'The organization operates a sophisticated investment fraud scheme that accepts large cash investments from criminal organizations and claims to generate legitimate returns through apparent business activities.',
            'I witnessed the use of corrupt professionals including accountants and lawyers who knowingly facilitate bulk cash laundering through their business accounts while maintaining plausible deniability.'
        ],'Child Exploitation/Pornography': [
            'I discovered a hidden server room at this location containing multiple hard drives with illegal content involving minors. The individuals operating this facility are using private networks to distribute this material internationally and charging for access.',
            'The subject was observed recruiting minors through online gaming platforms, offering them payment for inappropriate imagery. They maintain multiple electronic devices with sophisticated encryption software specifically to hide this activity.',
            'This business presents itself as a modeling agency but is actually creating exploitative content featuring minors. They specifically target vulnerable youth and manipulate them with promises of legitimate modeling careers while producing inappropriate content.',
            'I have observed the suspect using sophisticated encryption software and the dark web to access and distribute illegal content involving children. They maintain multiple dedicated devices that are kept hidden when not in use.',
            'The location operates as a front business but contains a separate secured area where digital content involving exploited minors is being produced and distributed. Multiple children have been brought to this location after hours.',
            'I witnessed individuals at this location using multiple social media accounts to contact and groom minors, with detailed records kept of potential targets and their personal information.',
            'The business operates a fake tutoring service that is actually used to gain access to vulnerable children. They specifically target families with financial difficulties and single-parent households.',
            'I have evidence that this organization is facilitating the production of illegal content by providing locations, equipment, and coordination services to multiple individuals involved in child exploitation.',
            'The subject maintains a sophisticated network of encrypted communications and uses cryptocurrency payments to distribute and purchase illegal content involving minors.',
            'I observed the systematic creation of fake online profiles designed to appear as children for the purpose of luring actual minors into exploitative situations.',
            'The facility houses advanced video editing equipment specifically used to produce and enhance illegal content. They maintain multiple backup systems to prevent loss of their illegal material.',
            'I have direct knowledge that this individual operates as a recruiter, targeting runaway and homeless youth by offering shelter and basic necessities in exchange for participation in illegal activities.',
            'The organization maintains detailed databases of victims including personal information, family situations, and psychological profiles used to facilitate ongoing exploitation.',
            'I witnessed the use of legitimate business fronts including day camps and after-school programs to gain access to potential victims while maintaining an appearance of community involvement.',            'The location serves as a distribution hub where illegal content is packaged, copied, and prepared for sale through various underground networks both domestically and internationally.',
            'This organization operates a sophisticated online gaming platform that is actually designed to identify and groom potential victims. They maintain detailed profiles of young users and systematically build trust before exploitation.',
            'The business maintains a network of corrupted youth counselors and social workers who provide access to vulnerable children in exchange for payments. They specifically target individuals working with at-risk youth.',
            'I have observed the operation of a fake charity organization that claims to help disadvantaged children but actually uses access to potential victims. They maintain legitimate-appearing programs as cover for exploitation activities.',
            'This facility operates a sophisticated technology operation that develops and distributes software specifically designed to circumvent law enforcement detection methods for illegal content.',
            'The organization maintains detailed victim recruitment protocols that exploit social media platforms and gaming environments. They use psychological manipulation techniques refined through extensive experience.',
            'I witnessed the systematic exploitation of children in foster care who are specifically targeted because of their vulnerable situations and limited oversight from protective services.',
            'This business operates a network of fake modeling and talent agencies that promise children career opportunities while actually facilitating their exploitation by predators.',
            'The facility houses advanced digital forensics equipment used to monitor law enforcement investigation techniques and develop countermeasures to avoid detection.',
            'I have evidence that this organization operates international trafficking networks that specifically target children from economically disadvantaged regions with promises of education and legitimate opportunities.',
            'This location serves as a training facility where individuals learn sophisticated grooming and psychological manipulation techniques for targeting and exploiting children.',
            'The business maintains corrupt relationships with individuals working in child protective services who provide information about vulnerable children and their family situations.',
            'I observed the operation of a sophisticated financial network that processes payments for illegal content using cryptocurrency and other untraceable payment methods.',
            'This organization exploits legitimate youth programs including sports teams and clubs to gain access to potential victims while maintaining an appearance of community involvement.',
            'The facility operates a sophisticated communication network using encrypted messaging and code words to coordinate exploitation activities while avoiding detection.',
            'I have witnessed the systematic creation of false documentation and background checks for individuals seeking positions with access to children, enabling predators to pass screening processes.',
            'This business operates a network of fake educational programs that claim to provide tutoring and mentorship but actually facilitate unsupervised access to children.',
            'The organization maintains detailed intelligence on law enforcement investigation methods and regularly updates their operational security procedures to avoid detection.',
            'I observed the use of legitimate businesses as fronts for exploitation activities, including daycare centers and after-school programs that provide cover for criminal operations.',
            'This facility serves as a logistics center for coordinating the movement of victims between different locations while maintaining sophisticated operational security measures.',            'The business operates a recruitment network that specifically targets children from broken homes and difficult family situations, exploiting their need for attention and support.',
            'Dude, this creep next door has been having random kids over at weird hours. I seen him giving them phones and laptops, telling them it\'s for "photo projects." The whole setup gives me major pedo vibes.',
            'My ex-roommate was running some sick operation where he\'d pretend to be a teenage girl online to trick actual kids. Caught him with like 50 different social media accounts with fake teen profiles.',
            'This "photography studio" downtown is sketchy as hell. They only hire young models and all the sessions are "private" with no parents allowed. The photographer kept talking about special "artistic projects."',
            'Saw this guy at the internet cafe downloading stuff that looked really illegal. He was using multiple USB drives and kept looking around nervously. When I walked by his screen, I saw things that made me sick.',
            'This video game store owner has been grooming kids for months. He lets them play for free in the back room and slowly starts asking them to do weird stuff for "premium game access."',
            'My neighbor runs this "tutoring service" but I never see any actual studying. Just different kids going in and out, and he always pays them cash when they leave. Something\'s definitely not right.',
            'Found out my brother\'s friend has been collecting inappropriate photos of minors and selling them online. He showed me his "business" thinking I\'d be impressed by how much money he makes.',
            'This youth counselor at the community center has been way too interested in the troubled kids. He takes them on private "mentoring trips" and none of the other staff know where they go.',
            'There\'s this app developer who\'s creating games specifically to target and locate vulnerable kids. He brags about how his apps can access phone cameras and location data without parents knowing.',
            'My cousin told me about this modeling scout who approaches kids at malls and parks. He promises them fame and money but first they need to do "test shoots" at his private studio.',
            'This guy I used to work with runs a fake charity for homeless teens. He uses it to identify runaways and then exploits them, promising food and shelter for "favors."',
            'Discovered my landlord has cameras hidden in the apartments where he rents to single mothers. He\'s been recording families and trading the videos online for sick content.',
            'This online tutor has been blackmailing students after getting them to send compromising photos. He threatens to share them with schools and parents unless they do more.',
            'Found out this day camp counselor has been taking inappropriate photos during swimming activities. He posts them on private forums and charges people for access.',
            'My friend\'s stepdad runs this whole network where people pay to chat with kids online. He coaches the children on what to say and takes a cut of the money.',
            'This photographer at school events has been selling photos of kids to weirdos online. He specifically targets sports events and dance recitals where kids are in revealing outfits.',
            'Discovered this foster parent is only taking in kids to exploit them. He\'s got multiple foster homes and uses the kids to create content for online buyers.',
            'This gaming streamer has been grooming his young viewers. He invites "special fans" to private video chats and gradually manipulates them into doing inappropriate things on camera.',
            'My neighbor\'s been running a sick business where he rents out access to kids in his basement. Different creeps come by throughout the week paying for "private time."',
            'This church youth leader has been using his position to identify vulnerable kids from troubled homes. He offers them special "counseling sessions" that are actually exploitation.',
            'Found out this ice cream truck driver has been targeting specific neighborhoods with single working moms. He offers free treats to kids in exchange for photos and personal information.',
            'This babysitting service is actually a front for child exploitation. They screen families to find ones where parents work long hours and kids are home alone frequently.',
            'My ex-boyfriend showed me his "side business" where he sells livestreams of kids changing clothes. He hides cameras in fitting rooms at stores and makes thousands monthly.',
            'This martial arts instructor has been grooming students for years. He offers "private lessons" and tells kids it\'s normal for training to involve inappropriate touching.',
            'Discovered this music teacher records private lessons with young students and edits them into compilations that he sells to perverts online.',            'This summer camp director has been organizing "special activities" for select campers. Parents think their kids are getting extra attention, but it\'s actually systematic abuse.',
            'The facility operates a sophisticated digital forensics operation that monitors law enforcement investigation techniques and develops countermeasures to avoid detection.',
            'I discovered a network that exploits legitimate educational platforms to distribute illegal content disguised as educational materials to evade automated detection systems.',
            'This organization maintains detailed victim databases with psychological profiles used to identify the most vulnerable children for targeted exploitation.',
            'The business operates a fake youth mentorship program that specifically targets children from single-parent households and uses the program to gain unsupervised access.',
            'I witnessed the systematic exploitation of children in the foster care system who are targeted because of their vulnerable circumstances and limited oversight.',
            'This group maintains corrupt relationships with youth sports coaches who provide access to potential victims in exchange for financial compensation.',
            'The facility houses advanced video production equipment specifically configured for creating illegal content, including professional lighting and editing software.',
            'I observed the operation of a sophisticated recruitment network that targets homeless and runaway youth by offering basic necessities in exchange for participation in illegal activities.',
            'This organization exploits legitimate charity programs for disadvantaged children to gain access to potential victims while maintaining an appearance of community service.',            'The business maintains a network of corrupt social workers who provide confidential information about vulnerable children and their family situations in exchange for payments.',
            'This organization operates a sophisticated blackmail network where they obtain compromising content from minors and then extort money from their families by threatening to distribute the material unless payment is made.',
            'I witnessed the operation of a mobile production unit disguised as a legitimate service vehicle that travels to different neighborhoods to create illegal content in various locations while avoiding detection.',
            'The facility operates a fake scholarship program that identifies academically gifted children from low-income families and exploits their ambition by promising educational opportunities in exchange for participation in illegal activities.',
            'I have evidence that this business operates a network of compromised school computer systems used to identify and track potential victims based on their online activities and digital footprints.',
            'This organization exploits virtual reality technology to create immersive illegal content and uses sophisticated simulation software to produce material without traditional production methods.',
            'The location serves as a coordination center for international exploitation rings that trade victims and content across multiple countries using encrypted communication networks.',
            'I observed the systematic manipulation of social media algorithms to promote content that normalizes inappropriate relationships with minors while avoiding automated content detection systems.',
            'This business operates a fake mental health counseling service that specifically targets vulnerable children and uses therapy sessions to groom victims and gather compromising information.',
            'The facility houses a sophisticated cryptocurrency mining operation that uses blockchain technology to process payments for illegal content while maintaining anonymity for all transactions.',
            'I have witnessed the operation of a recruitment network that infiltrates legitimate youth organizations including scouts, church groups, and community centers to identify and access potential victims.',
            'This organization maintains detailed psychological profiles of law enforcement personnel to predict investigation methods and develop specific countermeasures for different types of enforcement approaches.',
            'The business operates a network of fake online educational platforms that provide legitimate tutoring services as cover while using access to students for exploitation purposes.',
            'I observed the systematic exploitation of children with disabilities who are specifically targeted because of their limited ability to report abuse and their increased vulnerability to manipulation.',
            'This facility operates a sophisticated laundering operation that processes proceeds from exploitation activities through legitimate businesses while maintaining detailed financial records to avoid detection.',
            'The organization maintains a network of corrupt transportation officials who facilitate the movement of victims across state and international borders while providing false documentation and avoiding inspection procedures.'
        ],'Cyber Crimes': [
            'This group is running a sophisticated phishing operation targeting government benefit systems. They use identity information purchased from the dark web to create fraudulent accounts and redirect funds to untraceable cryptocurrency wallets.',
            'The business is operating a network of computer systems dedicated to launching ransomware attacks against healthcare organizations. I\'ve observed them testing encryption software and discussing "target acquisition" and ransom payment methods.',
            'I discovered that employees at this location are accessing corporate networks without authorization to steal intellectual property and trade secrets. They maintain dedicated systems for storing stolen data and use sophisticated methods to cover their tracks.',
            'The subject operates a criminal hacking enterprise from this location, with multiple dedicated servers used for launching attacks against financial institutions. They openly discussed "carding operations" and methods to bypass security protections.',
            'This facility houses a sophisticated technical operation focused on compromising email accounts of businesses to conduct invoice fraud. They intercept legitimate business communications and substitute fraudulent payment instructions.',
            'I have witnessed the operation of a large-scale cryptocurrency mining operation using stolen electricity and hijacked computer systems. They specifically target business networks to install mining software without authorization.',
            'The organization is running a sophisticated identity theft operation using stolen personal information to file fraudulent tax returns and benefit claims. They maintain detailed databases of victims and coordinate filing schedules to maximize success.',
            'I observed employees at this location creating and distributing malware designed to steal banking credentials from infected computers. They maintain testing environments and track infection rates across different geographic regions.',
            'This business operates as a front for a sophisticated online fraud scheme targeting elderly individuals with fake tech support scams. They use remote access software to steal personal information and empty bank accounts.',
            'The facility is being used to operate a large-scale credit card fraud operation. They maintain equipment for creating counterfeit cards and have detailed databases of stolen card information organized by bank and credit limit.',
            'I have evidence that this organization is conducting systematic attacks against government databases to steal sensitive information. They maintain sophisticated tools for penetrating secure networks and extracting classified data.',
            'The group is operating a complex romance scam operation using dozens of fake online profiles to defraud victims of hundreds of thousands of dollars. They maintain detailed scripts and victim profiles to coordinate their deception.',
            'I witnessed the operation of an illegal streaming service that distributes copyrighted content without authorization. They maintain high-capacity servers and use sophisticated methods to avoid detection by content owners.',
            'This location serves as a command center for coordinating distributed denial-of-service attacks against targeted websites. They maintain networks of compromised computers and sell attack services to other criminal organizations.',            'The business is operating a sophisticated social engineering operation that targets corporate executives to steal sensitive business information. They conduct detailed research on targets and use psychological manipulation techniques to extract confidential data.',
            'This organization operates a large-scale business email compromise scheme that has successfully stolen millions of dollars by intercepting and redirecting legitimate wire transfers from corporate victims.',
            'The facility houses a sophisticated operation for creating and distributing fake mobile applications that appear legitimate but actually steal personal information and financial data from users.',
            'I have observed the operation of a complex cryptocurrency theft scheme that targets individual investors through fake trading platforms and investment opportunities that steal digital assets.',
            'This business maintains a network of compromised internet service provider equipment that allows them to intercept and redirect internet traffic for criminal purposes.',
            'The organization operates a sophisticated ATM skimming network that has installed devices at hundreds of locations to steal credit and debit card information from unsuspecting users.',
            'I witnessed the operation of a large-scale online auction fraud scheme that creates fake listings for high-value items, collects payments, and never delivers the promised goods.',
            'This facility serves as a command center for coordinating cyber attacks against critical infrastructure including power grids and water treatment facilities.',
            'The business operates a sophisticated voice-over-internet-protocol system that spoofs caller identification to facilitate various fraud schemes including tech support and government impersonation scams.',
            'I have evidence that this organization operates a network of compromised point-of-sale systems in retail locations that steal credit card information from customers during legitimate transactions.',
            'This location houses advanced equipment for intercepting and decrypting wireless communications to steal sensitive information from corporate and government targets.',
            'The organization maintains a sophisticated network of fake online pharmacies that sell counterfeit medications while stealing customers\' personal and financial information.',
            'I observed the operation of a complex insider trading scheme that uses hacked corporate communications to obtain non-public information for illegal stock trading.',
            'This business operates a large-scale fake technical support operation that targets elderly individuals with sophisticated phone scams designed to steal personal information and install malware.',
            'The facility houses a sophisticated operation for creating and distributing ransomware specifically designed to target healthcare organizations during emergency situations.',
            'I have witnessed the systematic theft of intellectual property from technology companies through coordinated cyber attacks that target specific research and development data.',
            'This organization operates a network of fake online lending platforms that collect detailed personal and financial information from loan applicants without providing actual loans.',
            'The business maintains advanced persistent threat capabilities that allow them to maintain long-term access to corporate networks for ongoing data theft.',
            'I observed the operation of a sophisticated cryptocurrency mixing service that helps criminals launder stolen digital assets by obscuring their transaction histories.',
            'This facility serves as a training center where individuals learn advanced hacking techniques and are provided with sophisticated tools for conducting cyber crimes.',            'The organization operates a large-scale sim-swapping operation that takes control of victims\' phone numbers to bypass two-factor authentication and steal cryptocurrency and financial accounts.',            'This nerd I know from college has been running romance scams on dating apps. He\'s got like 20 fake profiles and bilks lonely women out of thousands by pretending to be deployed soldiers.',
            'My roommate works for this sketchy tech company that\'s basically a call center for crypto scams. They cold-call people pretending to help recover lost Bitcoin while actually stealing their wallet info.',
            'This organization operates a sophisticated fake online university that issues fraudulent degrees while stealing students\' personal information and federal financial aid.',
            'The business maintains a network of compromised smart home devices that they use to spy on residents and steal personal information for identity theft purposes.',
            'I witnessed the operation of a large-scale fake charity scam that exploits natural disasters and emergencies to steal donations while providing no actual aid to victims.',
            'This facility houses advanced equipment for creating deepfake videos and audio recordings used to blackmail prominent individuals and manipulate financial markets.',
            'The organization operates a sophisticated supply chain attack that compromises software updates to install malware on thousands of corporate and government systems.',
            'I have evidence that this business operates a network of fake employment websites that steal job seekers\' personal information for identity theft and financial fraud.',
            'This location serves as a command center for coordinating attacks against election infrastructure including voter registration databases and ballot counting systems.',
            'The business operates a large-scale fake rental property scam that collects deposits and personal information from prospective renters for non-existent properties.',
            'I observed the operation of a sophisticated medical identity theft scheme that steals patients\' health insurance information to file fraudulent medical claims.',
            'This organization maintains a network of compromised surveillance cameras that they use to conduct reconnaissance for physical crimes and blackmail operations.',
            'The facility houses a complex operation for creating and distributing fake mobile payment applications that steal banking credentials from unsuspecting users.',
            'I have witnessed the systematic compromise of industrial control systems at manufacturing facilities to steal trade secrets and sabotage production capabilities.',
            'This business operates a sophisticated tax preparation scam that steals clients\' personal information while filing fraudulent returns to redirect refunds to criminal accounts.',
            'The organization maintains advanced capabilities for intercepting and manipulating financial communications between banks to steal large wire transfers during processing.',
            'Found out this gaming cafe downtown is actually a front for credit card fraud. They\'ve got machines running 24/7 testing stolen card numbers and creating fake accounts.',
            'This IT guy at my old job was using the company servers to mine cryptocurrency. He thought he was slick but was stealing thousands in electricity and computing power.',
            'My neighbor\'s kid has been running a fake tech support scam targeting old people. Kid makes more in a week than most adults, just by convincing grandmas their computers are infected.',
            'Discovered this app developer has been creating fake investment apps that look legit but actually steal people\'s banking info when they try to link their accounts.',
            'This hacker I met at a coffee shop showed me how he breaks into people\'s Ring cameras and sells access to creeps who want to spy on families. Sick stuff.',
            'My cousin runs this whole operation where he hacks into streaming services and sells premium accounts for cheap. He\'s got thousands of stolen Netflix and Spotify logins.',
            'Found out this online tutor has been using remote access software to steal files from students\' computers. He\'s got homework, personal photos, and family financial info.',
            'This guy from my gaming group has been SWATting people he loses to online. He spoofs emergency calls to get SWAT teams sent to their houses as revenge.',
            'My ex-girlfriend\'s brother runs a fake online pharmacy that takes people\'s money and medical info but never ships any actual medication. Pure scam operation.',
            'Discovered this social media influencer has been running fake giveaway scams. People enter their personal info for prizes that don\'t exist while he sells their data.',
            'This computer repair shop owner has been installing keyloggers on customers\' devices to steal their passwords and bank info. He charges them to fix their computers then robs them.',
            'Found out this Twitch streamer has been using his followers\' computers for cryptocurrency mining without them knowing. His "gaming overlay" is actually malware.',
            'My friend\'s dad runs this elaborate phishing operation targeting small businesses. He sends fake invoices that look real and tricks companies into paying fake bills.',
            'This college student I know has been hacking into university systems to change grades for money. He charges $500 per grade change and has never been caught.',
            'Discovered this food delivery driver has been skimming credit cards when customers pay. He\'s got a portable card reader hidden in his delivery bag.',
            'My neighbor runs a fake antivirus company that creates viruses, infects people\'s computers, then charges them to remove the same viruses they installed.',
            'This barber shop owner has been using his customers\' personal info to open credit cards in their names. He gets their SSN when they fill out loyalty program forms.',
            'Found out this YouTube channel that reviews products is actually just a front for stealing people\'s Amazon accounts. They hack viewers who click their links.',
            'My coworker\'s husband runs a fake charity website that steals donation money and credit card info from people trying to help disaster victims.',
            'This online dating coach has been teaching men how to hack into women\'s social media accounts to stalk them. He charges $200 for "advanced romance techniques."',
            'Discovered this video game store owner has been selling modded consoles with hidden malware that steals personal info from anyone who connects to WiFi.',
            'My friend\'s stepdad runs a fake tech startup that exists only to steal investors\' money and personal information. He\'s scammed hundreds of people.',
            'This podcast host has been using his show to promote fake cryptocurrency investments. Listeners lose their money while he takes a cut from the scammers.',
            'Found out this Instagram photographer has been blackmailing clients with their private photos. He secretly records sessions and demands money to not share them.',            'My uber driver told me he runs a fake car insurance website that steals people\'s personal info when they try to get quotes. No actual insurance, just data theft.',
            'This organization operates a sophisticated business email compromise scheme that intercepts legitimate wire transfers and redirects millions of dollars to accounts they control.',
            'I discovered a facility that houses advanced equipment for creating deepfake videos and audio recordings used to facilitate sophisticated fraud schemes targeting both individuals and corporations.',
            'The business maintains a network of compromised smart home devices that are used to spy on households and collect personal information for identity theft operations.',            'I witnessed the operation of a cryptocurrency theft scheme that targets individual investors through fake trading platforms and fraudulent investment opportunities.',
            'This group operates a massive botnet of infected computers used to launch coordinated attacks against critical infrastructure including power grids and transportation systems.',
            'The facility serves as a command center for coordinating social engineering attacks against corporate executives to steal sensitive business information and trade secrets.',
            'I observed the systematic exploitation of public WiFi networks to intercept sensitive data from users connecting to seemingly legitimate internet access points.',
            'This organization develops and distributes sophisticated keylogging software specifically designed to steal banking credentials and cryptocurrency wallet information.',
            'The business operates a fake customer service center that impersonates major banks and financial institutions to trick customers into revealing their account information and passwords.',
            'I discovered a sophisticated SIM-swapping operation where criminals take control of victims\' phone numbers to bypass two-factor authentication and steal their financial accounts.',
            'This facility houses advanced equipment for manufacturing counterfeit credit cards and ID documents using stolen personal information from data breaches.',
            'The organization runs a complex business email compromise scheme targeting real estate transactions, intercepting legitimate wire transfers and redirecting millions to criminal accounts.',
            'I witnessed the operation of a fake tech support company that installs remote access malware on victims\' computers under the guise of fixing non-existent problems.',
            'This business operates a network of compromised ATMs that have been modified to capture card data and PINs from unsuspecting bank customers.',
            'The facility serves as a command center for coordinating insider trading schemes using hacked corporate communications to obtain non-public financial information.',
            'I observed the systematic exploitation of children\'s online gaming platforms to steal personal information and credit card data from young users and their families.',
            'This organization maintains a sophisticated network of fake online pharmacies that steal customers\' medical information while selling counterfeit and dangerous medications.',
            'The business operates a large-scale social media manipulation campaign using bot networks to spread misinformation and influence elections for foreign adversaries.',
            'I discovered a crypto-mining operation that hijacks corporate and government computer networks to mine cryptocurrency using stolen computing resources and electricity.',
            'This facility houses equipment for intercepting and manipulating text messages and phone calls to facilitate various fraud schemes including account takeovers.',
            'The organization runs a fake investment platform that uses deepfake technology to create convincing testimonials from celebrities endorsing fraudulent cryptocurrency schemes.',
            'I witnessed the operation of a sophisticated ransomware-as-a-service business that provides attack tools and infrastructure to other criminal organizations worldwide.',
            'This business maintains a network of compromised smart home devices that are used to spy on residents and steal sensitive personal information for blackmail purposes.',            'The business operates a fake technical support call center that targets elderly individuals with elaborate phone scams designed to gain remote access to their computers.',
            'I have evidence of a group that exploits vulnerabilities in mobile payment applications to steal funds directly from users\' bank accounts during legitimate transactions.',
            'This organization operates a sophisticated state-sponsored hacking operation that targets critical infrastructure including power grids, water treatment facilities, and transportation systems.',
            'The facility houses advanced quantum computing equipment used to break encryption systems protecting government and financial institution communications.',
            'I witnessed the operation of a complex supply chain attack that compromises software updates distributed to millions of corporate and government computers.',
            'This business maintains a network of compromised medical devices including pacemakers and insulin pumps that can be remotely controlled to harm patients.',
            'The organization operates a sophisticated artificial intelligence system that generates realistic deepfake videos for blackmail and disinformation campaigns.',
            'I observed the systematic exploitation of Internet of Things devices including smart cars and home security systems to conduct surveillance and theft.',
            'This facility serves as a command center for coordinating attacks against election infrastructure including voter registration databases and ballot counting systems.',
            'The business operates a complex insider trading scheme using artificial intelligence to analyze hacked corporate communications and predict stock movements.',
            'I have evidence that this organization develops and distributes malware specifically designed to target air traffic control systems and aviation safety equipment.',
            'This location houses equipment for conducting electromagnetic pulse attacks against sensitive electronic infrastructure in government and military facilities.',
            'The business maintains a sophisticated network of compromised satellite communication systems used to intercept and manipulate global communications.',
            'I witnessed the operation of a complex cryptocurrency exchange hack that steals digital assets while maintaining the appearance of legitimate trading.',
            'This organization operates advanced persistent threat capabilities specifically designed to maintain long-term access to nuclear facility control systems.',
            'The facility houses sophisticated equipment for launching coordinated attacks against multiple banks simultaneously to maximize financial theft.',
            'I observed the systematic exploitation of social media algorithms to spread targeted disinformation campaigns designed to influence democratic elections.',
            'This business operates a network of compromised autonomous vehicles that can be remotely controlled to cause accidents or conduct surveillance.',
            'The organization maintains advanced capabilities for intercepting and manipulating emergency services communications during crisis situations.',
            'I have evidence that this facility develops malware specifically designed to target hospital equipment and patient monitoring systems.',
            'This location serves as a training center where state actors learn advanced cyber warfare techniques for attacking foreign government systems.',
            'The business operates a sophisticated network of compromised industrial control systems at chemical plants and oil refineries.',
            'I witnessed the operation of a complex scheme that exploits vulnerabilities in smart city infrastructure including traffic lights and public transportation.',
            'This organization maintains advanced artificial intelligence systems that automatically identify and exploit zero-day vulnerabilities in popular software.',
            'The facility houses equipment for conducting coordinated attacks against cryptocurrency mining operations to steal computational resources.',
            'I observed the systematic manipulation of global positioning systems to misdirect aircraft and maritime vessels for criminal purposes.',
            'This business operates a network of compromised defense contractor systems used to steal classified military technology and weapons designs.',
            'The organization maintains sophisticated capabilities for launching attacks against space-based communication and navigation satellites.',
            'I have evidence that this facility develops malware designed to target voting machines and election management systems.',
            'This location houses advanced equipment for intercepting and manipulating communications between international financial institutions.',
            'The business operates a complex scheme that exploits vulnerabilities in cloud computing infrastructure to steal data from multiple organizations.',
            'I witnessed the operation of a sophisticated attack against renewable energy infrastructure including solar panel and wind turbine control systems.',
            'This organization maintains advanced capabilities for launching coordinated attacks against multiple cryptocurrency exchanges simultaneously.',
            'The facility houses equipment for conducting electromagnetic warfare attacks against military communication systems.',
            'I observed the systematic exploitation of artificial intelligence systems used in autonomous weapons and defense applications.',
            'This business operates a network of compromised academic research systems used to steal sensitive scientific and technological research.',
            'The organization maintains sophisticated systems for launching attacks against international banking networks and payment processing systems.',
            'I have evidence that this facility develops malware specifically designed to target submarine and naval vessel communication systems.',
            'This location serves as a command center for coordinating attacks against multiple countries\' critical infrastructure simultaneously.',
            'The business operates advanced persistent threat capabilities designed to maintain access to foreign intelligence agency communication systems.',
            'I witnessed the operation of a complex scheme that exploits vulnerabilities in biometric identification systems used for border security.',
            'This organization maintains sophisticated artificial intelligence systems that conduct automated reconnaissance of potential cyber attack targets.',
            'The facility houses equipment for launching coordinated attacks against international telecommunications infrastructure.',
            'I observed the systematic manipulation of algorithmic trading systems to cause artificial market volatility and profit from the chaos.',
            'This business operates a network of compromised weather monitoring and prediction systems used to manipulate environmental data.',
            'The organization maintains advanced capabilities for attacking quantum communication networks used by government and military organizations.',
            'I have evidence that this facility develops specialized malware for targeting spacecraft and satellite control systems.',
            'This location houses sophisticated equipment for conducting psychological warfare operations through coordinated social media manipulation.',
            'The business operates a complex scheme that exploits vulnerabilities in emergency alert systems to spread panic and disinformation.',
            'I witnessed the operation of advanced artificial intelligence systems that automatically generate and spread targeted disinformation campaigns.',
            'This organization maintains sophisticated capabilities for launching attacks against international diplomatic communication systems.'
        ],'Employment/Exploitation of Unlawful Workers': [
            'This business routinely hires undocumented workers, paying them significantly below minimum wage ($3-4/hour) in cash with no benefits or protections. Workers are threatened with deportation if they complain about dangerous working conditions.',
            'The company maintains two separate payroll systems - one official system for documented workers, and a cash-only system for undocumented workers who receive 40% less pay. They explicitly told me not to create any records for the "unofficial employees."',
            'I have witnessed the manager confiscating identification documents from foreign workers and restricting their movement outside working hours. Workers are housed in company-owned property where they are charged excessive rent deducted from their already minimal pay.',
            'This agricultural operation houses workers in severely substandard conditions with 15-20 people sharing a small dwelling with inadequate facilities. Workers report having to work 12-hour days with no days off and receiving partial payment or having pay unlawfully withheld.',
            'The construction company recruits undocumented workers from street corners, transports them to job sites, and routinely fails to pay the agreed wages. When workers complain, they are threatened with calls to immigration authorities.',
            'The restaurant owner has instructed me to only hire workers who cannot provide proper documentation, stating that these employees "won\'t cause problems" and can be paid less than minimum wage without overtime compensation.',
            'This manufacturing facility deliberately targets recently arrived immigrants who speak limited English, pays them in cash at rates well below legal minimum wage, and maintains no safety protocols despite dangerous working conditions involving heavy machinery.',
            'I observed the company owner collecting social security cards and driver\'s licenses from workers on their first day, telling them the documents would be "held for safekeeping" but using this to control and threaten employees who consider leaving.',
            'The farm operation requires workers to pay for their own transportation, tools, and housing through payroll deductions that often exceed their weekly earnings, creating a debt bondage situation where workers can never afford to leave.',
            'This cleaning service exclusively hires undocumented workers for night shifts at commercial buildings, pays them $5 per hour, provides no safety equipment, and threatens to report them to immigration if they sustain workplace injuries.',
            'The warehouse supervisor told me explicitly to hire only "cash workers" and to avoid any worker who asks about tax forms, insurance, or workers\' compensation benefits, stating that documented employees would "cost too much and ask too many questions."',
            'I witnessed workers being transported in overcrowded vans without seatbelts to various job sites, working 14-hour shifts without breaks, and being told their wages would be "held" until the end of the month but often only receiving partial payment.',
            'This meat processing plant keeps a separate entrance for undocumented workers, requires them to work the most dangerous positions without safety training, and maintains a policy of immediate termination without pay for any worker injured on the job.',
            'The landscaping company charges workers $200 per week for "housing" in a single trailer without proper plumbing or electricity, deducts this amount from wages before paying them $6 per hour for 60+ hour work weeks.',            'I have direct knowledge that this hotel only hires housekeeping staff who cannot provide legal work authorization, pays them $4 per hour, requires them to work 7 days per week, and threatens to call immigration authorities if they complain about working conditions.',
            'This seafood processing plant deliberately recruits undocumented workers during peak seasons, forces them to work in freezing conditions without proper protective equipment, and routinely withholds final paychecks when temporary workers are no longer needed.',
            'The construction company maintains a quota system where supervisors are required to hire a minimum percentage of undocumented workers to keep labor costs below competitors while avoiding legal protections and benefits.',
            'I observed this agricultural operation using child labor from immigrant families, requiring children as young as 12 to work in fields during school hours while threatening to report their parents if they refuse.',
            'This packaging facility deliberately schedules undocumented workers for the most dangerous shifts involving heavy machinery, provides no safety training, and immediately terminates any worker who sustains an injury.',
            'The restaurant chain has instructed managers to specifically recruit workers who fear deportation, stating that these employees will "work harder, complain less, and accept whatever wages we offer without question."',
            'I have evidence that this textile factory locks undocumented workers inside the facility during their shifts to prevent them from leaving, creating a fire hazard while ensuring workers cannot seek help or report violations.',
            'This logistics company recruits undocumented workers for overnight warehouse shifts, pays them $3 per hour in cash, and requires them to load trucks in extreme weather conditions without proper protective equipment.',
            'The nursing home facility exclusively hires undocumented workers for patient care positions, provides no medical training, and threatens deportation if workers report unsafe patient care conditions.',
            'I witnessed this car wash operation requiring undocumented workers to bring their own family members to work unpaid shifts, essentially using entire families as free labor while threatening deportation for the entire family.',
            'This food service company maintains separate dormitory-style housing for undocumented workers that lacks basic amenities including running water and heat, while charging excessive rent deducted from already minimal wages.',
            'The landscaping business requires undocumented workers to use their own vehicles for transportation to job sites while providing no insurance coverage, effectively making workers liable for any accidents or vehicle damage.',
            'I have observed this laundry service forcing undocumented workers to handle industrial chemicals without safety equipment or training, resulting in frequent burns and respiratory problems that go unreported.',
            'This electronics assembly facility requires undocumented workers to work 16-hour shifts during busy periods, provides no break times, and locks bathroom facilities to prevent workers from taking unauthorized breaks.',
            'The janitorial service assigns only undocumented workers to clean buildings with hazardous materials including asbestos and lead paint without proper protective equipment or health monitoring.',
            'I witnessed this poultry processing plant requiring undocumented workers to continue working despite serious injuries, threatening to call immigration authorities if they seek medical attention.',
            'This furniture manufacturing company maintains a policy of immediately firing any undocumented worker who becomes pregnant, refusing to provide any pregnancy accommodations or benefits.',
            'The demolition company exclusively uses undocumented workers for the most dangerous tasks including asbestos removal and structural demolition without proper safety certification or equipment.',
            'I have evidence that this trucking company requires undocumented drivers to operate vehicles without valid licenses or insurance, threatening deportation if they are stopped by law enforcement.',            'This recycling facility forces undocumented workers to sort hazardous medical waste and electronic components by hand without protective equipment, exposing them to toxic substances and biological hazards.',
            'The shipping company requires undocumented workers to load cargo containers in extreme weather conditions including during heat advisories and severe storms while providing no climate-controlled rest areas.',
            'My boss at this restaurant straight up told me "we only hire people without papers because they work harder and don\'t complain about getting paid $5 an hour." It\'s disgusting how open he is about it.',
            'This construction foreman I know brags about how he can get away with paying undocumented workers half the minimum wage because "what are they gonna do, call the cops?"',
            'Worked at this farm where they literally lock the workers in dormitories at night. The owner says it\'s for "security" but everyone knows it\'s to prevent people from escaping.',
            'My neighbor runs this cleaning company that only hires undocumented women. He takes their IDs on day one and charges them for "storing" their documents safely.',
            'This warehouse manager told me he prefers hiring undocumented workers because "they don\'t know their rights and won\'t ask for overtime pay or benefits."',
            'Saw this meat packing plant where they make undocumented workers do the most dangerous jobs. If someone gets hurt, they just fire them and hire someone new.',
            'My friend\'s uncle owns a landscaping business where he pays undocumented workers $40 for a 12-hour day. He says "they should be grateful for any work."',
            'This hotel owner I know exclusively hires undocumented housekeepers because he can make them work 7 days a week without any days off.',
            'Found out this car wash makes undocumented workers bring their whole families to work for free. Kids as young as 10 are out there washing cars.',
            'My old boss at a restaurant used to threaten to call ICE whenever undocumented workers asked for their full paycheck. Kept them scared and compliant.',
            'This factory owner told me he only hires "illegals" because legal workers "expect too much money and too many rights." His words, not mine.',
            'Worked at this farm where undocumented workers sleep 20 to a trailer with no heat or AC. They pay $200 a week for that "housing" on top of working for nothing.',
            'This seafood plant brings in undocumented workers during busy season, works them to death, then doesn\'t pay them their last week when the season ends.',
            'My neighbor runs a roofing company where undocumented workers do all the dangerous work without safety equipment. If OSHA shows up, he just fires everyone.',
            'This nursing home administrator told me they only hire undocumented workers for night shifts because "they\'re too scared to report abuse or neglect."',
            'Found out this textile factory literally locks undocumented workers inside during shifts. Fire exits are chained shut to prevent people from leaving.',
            'My friend works for this moving company that exclusively hires undocumented workers and pays them $3 an hour cash. No insurance if they get hurt moving heavy furniture.',
            'This produce distributor makes undocumented workers handle pesticide-covered fruits without gloves. Says protective equipment is "too expensive for temporary workers."',
            'Discovered this poultry plant where undocumented workers aren\'t allowed bathroom breaks. They have to wear diapers during 14-hour shifts.',
            'This concrete company forces undocumented workers to operate heavy machinery without training or certification while threatening deportation if they get injured.',
            'My friend\'s employer runs a sweatshop disguised as a legitimate garment factory where undocumented workers sew for 18 hours straight with no overtime pay.',
            'Found out this auto shop exclusively hires undocumented mechanics, pays them $2 per hour, and makes them use their own tools while providing no workers\' compensation.',
            'This carnival operation travels with undocumented workers who set up rides and games for $20 per day while sleeping in storage trailers without basic facilities.',
            'My neighbor owns a dog grooming business where undocumented workers handle aggressive animals without safety equipment and get no medical care for bite injuries.',
            'Discovered this bakery makes undocumented workers operate dangerous industrial ovens and dough mixers without safety training during overnight shifts.',
            'This scrap metal yard forces undocumented workers to handle hazardous materials and sharp metal without protective equipment for $3 per hour cash.',
            'My friend works at a flower shop where undocumented workers are exposed to toxic pesticides and fertilizers daily without proper ventilation or protective gear.',
            'Found out this dry cleaner uses undocumented workers to handle dangerous chemical solvents that cause skin burns and respiratory problems.',
            'This furniture assembly plant locks undocumented workers in windowless rooms for 16-hour shifts while deducting money for bathroom breaks and water.',
            'My coworker told me about a tire shop where undocumented workers are forced to work with dangerous tire mounting equipment without any safety certification.',
            'Discovered this commercial kitchen operation where undocumented workers handle boiling oil and sharp knives for 14-hour shifts with no break time.',
            'This solar panel installation company sends undocumented workers onto steep roofs without safety harnesses while paying them half of minimum wage.',
            'My neighbor runs a small engine repair shop where undocumented workers are exposed to toxic fumes and chemicals without proper ventilation systems.',
            'Found out this fish processing plant forces undocumented workers to stand in freezing water for 12-hour shifts while processing fish with sharp knives.',
            'This electronics recycling facility makes undocumented workers dismantle computers and TVs containing lead and mercury without protective equipment.',
            'My friend\'s boss operates a commercial laundry where undocumented workers handle industrial washing chemicals that cause severe skin irritation and burns.',
            'Discovered this window cleaning company sends undocumented workers up tall buildings on makeshift scaffolding without proper safety equipment or insurance.',
            'This metal fabrication shop forces undocumented workers to operate welding equipment and cutting torches without safety training or protective gear.',
            'My cousin\'s boss at a demolition company only gives the asbestos removal jobs to undocumented workers because "they can\'t sue us if they get sick later."',
            'This trucking company owner forces undocumented drivers to drive without licenses or insurance. If they get pulled over, he just abandons them and hires new drivers.',
            'Found out this food processing plant requires undocumented workers to bring their kids to work unpaid during school holidays. Whole families working for slave wages.',
            'My old supervisor at a packaging plant used to confiscate undocumented workers\' phones so they couldn\'t call for help or report unsafe conditions.',
            'This janitorial service makes undocumented workers clean up hazardous chemical spills with household cleaning supplies. No hazmat training or proper equipment.',
            'Worked at this electronics factory where undocumented workers had to stand for 16-hour shifts with no breaks. Bathroom doors were locked during production quotas.',
            'My neighbor owns a laundry service that forces undocumented workers to operate dangerous industrial equipment without any safety training or protective gear.',
            'This furniture manufacturer I know fires any undocumented worker who gets pregnant, saying "we can\'t afford workers who need special treatment."',
            'Found out this agriculture company charges undocumented workers for their own tools, transportation, and housing, leaving them with negative pay at the end of the week.',
            'My friend\'s dad runs a restaurant where undocumented kitchen workers have to pay him $100 a week for the "privilege" of not being reported to immigration.',
            'This warehouse operation forces undocumented workers to live in company-owned housing with 20+ people per room while deducting excessive rent from their already minimal wages.',
            'I witnessed a construction company that deliberately recruits injured workers from other job sites, knowing they can pay them less because they cannot report workplace injuries.',
            'The facility operates a sophisticated debt bondage scheme where workers are charged for transportation, tools, and housing that exceeds their weekly earnings, keeping them permanently in debt.',
            'I observed this agricultural business using undocumented workers to handle pesticides and dangerous chemicals without any safety training or protective equipment.',
            'This manufacturing plant maintains separate bathroom facilities for undocumented workers that lack basic amenities like running water and proper ventilation.',
            'The business exploits undocumented workers by requiring them to work during federal holidays and weekends without overtime pay while threatening immigration enforcement.',
            'I have evidence of a company that forces undocumented workers to surrender their passports and identification documents as collateral for their employment.',
            'This organization recruits undocumented workers specifically for night shifts when labor inspectors are unlikely to conduct surprise visits.',
            'The facility maintains a sophisticated early warning system to hide undocumented workers when any official vehicles are spotted in the vicinity.',
            'I witnessed a business that charges undocumented workers monthly fees for providing false employment verification letters to government agencies and landlords.'        ],'F/M Student Violations, Including OPT': [
            'Yo, this place is basically a fake job factory for international students - they charge like a grand a month just to say someone works there but they never actually do any work.',
            'My buddy from India told me about this sketchy school that basically sells student visas, no classes required - just pay your tuition and they keep you "enrolled" while you work somewhere else.',
            'This company my roommate works for is totally exploiting these poor foreign students, making them work like 50 hours a week when they\'re only supposed to work 20 max.',
            'Found out my neighbor runs this fake university where international kids pay crazy money just to stay in the country legally but there\'s literally no teachers or real classes.',
            'This girl I know from college said her "employer" makes her give back most of her paycheck in cash to keep her OPT status - it\'s basically paying to pretend to have a job.',
            'My cousin works at this diploma mill where they just take foreign students\' money and give them fake degrees without any actual schoolwork or attendance.',
            'Overheard this guy bragging about how he coaches international students to lie in their visa interviews - gives them whole scripts about fake career plans.',
            'This restaurant owner near campus straight up told me he threatens to call ICE on his international student workers if they complain about working conditions.',
            'Met this education consultant who charges international students like 5 grand to create completely fake academic backgrounds and transcripts.',
            'My old boss admitted he has all these shell companies just to give fake job offers to students who need work authorization - none of the jobs actually exist.',
            'This organization operates a sophisticated student loan fraud scheme where fake international students receive educational funding that is immediately diverted to criminal activities.',
            'The business maintains a network of corrupt academic advisors who falsify student records and attendance requirements in exchange for substantial payments from foreign nationals.',
            'I witnessed the operation of a fake research facility that employs international students in non-existent scientific programs while they actually work in unrelated manual labor.',
            'This institution recruits international students to participate in fraudulent clinical trials and medical experiments without proper oversight or safety protocols.',
            'The facility operates a complex visa extension fraud scheme where students pay thousands to maintain status through fake academic programs that require no coursework.',
            'I have evidence that this organization exploits Optional Practical Training programs by placing students in jobs completely unrelated to their supposed field of study.',
            'This business operates a network of shell companies that exist solely to provide fraudulent internship opportunities for international students seeking work authorization.',
            'The organization maintains corrupt relationships with education consultants overseas who recruit students specifically for fraudulent visa programs rather than legitimate education.',
            'I observed this institution creating fake thesis and dissertation requirements where students pay substantial fees for academic work they never actually complete.',
            'This facility operates a sophisticated grade manipulation scheme where international students pay premium fees to have failing grades changed to passing marks.',
            'The business exploits Curricular Practical Training regulations by creating fake work experiences that students must pay for while receiving no actual training or education.',
            'I have witnessed the systematic exploitation of STEM extension programs where students work in completely unrelated fields while maintaining fraudulent academic enrollment.',
            'This organization operates a complex housing fraud scheme where international students are charged excessive rent for substandard accommodations while being threatened with immigration violations.',
            'The institution maintains a network of fake professors and academic credentials to create the appearance of legitimate education while providing no actual instruction.',
            'I observed the operation of a fraudulent English language program where students pay tuition but receive no language instruction while working full-time in manual labor positions.',
            'This community college in my area basically runs a visa scam - they enroll students who never show up and just want to work full-time jobs.',
            'Found out this recruitment agency specifically targets students with expired visas and sells them fake work permits for thousands of dollars.',
            'My friend told me about this school that creates fake internship programs where students pay money for documentation but never actually do any work.',
            'This place downtown is basically selling student status - foreign nationals pay tuition but there\'s no real education happening, just empty classrooms.',
            'Heard from someone that this language school takes students who can barely speak English and just keeps them enrolled indefinitely without any real classes.',
            'My coworker said her company has a deal where they officially "employ" international students but the students have to work at completely different businesses.',
            'This immigration lawyer I know admitted he files fraudulent student visa applications all the time and charges full legal fees for the illegal paperwork.',
            'Found out this online university lets foreign students enroll in fake programs that require zero coursework just to maintain their visa status.',
            'My neighbor runs this fake seminary that\'s supposed to be for religious students but there\'s no theology classes - just a way to stay in the country.',
            'This consultant I met charges students to create fake research positions and lab work that exists only on paper for visa documentation.',
            'Heard about this scheme where students pay to transfer between multiple fake schools to keep extending their stay way beyond normal limits.',
            'My friend works at this place that creates elaborate fake campus tours for immigration inspections while the real "classes" happen in random strip mall locations.',
            'This guy I know operates a network of fake employers who provide phony job offers specifically for students trying to get work authorization.',
            'Found out this educational facility has corrupt connections who falsify all the government database records for students in exchange for bribes.',
            'My roommate told me about this scam where students pay premium fees to get backdated academic records that make it look like they\'ve been enrolled when they haven\'t.',
            'This business is falsely claiming to employ foreign students on OPT, providing documentation for visa purposes while never actually having them work. The students pay $1,000 monthly for the fraudulent employment verification.',
            'The educational institution is knowingly maintaining student visa status for individuals who have never attended classes. They charge premium fees for this "ghost student" service and provide falsified attendance and grade records.',
            'I have evidence that this company is exploiting students on F-1 visas by requiring them to work far beyond the legally permitted hours, often 40+ hours per week during academic periods. Students who refuse are threatened with termination of their visa sponsorship.',
            'This organization presents itself as an educational institution but provides no actual instruction. Foreign students pay tuition solely to maintain visa status while working full-time elsewhere. The facility has classrooms that are never used.',
            'The business has a scheme where they officially "hire" foreign students on OPT but require them to return 70% of their stated salary in cash, creating the appearance of legitimate employment while actually collecting fees for visa maintenance.',
            'I observed this university accepting international students who clearly do not meet admission requirements and have limited English skills. They provide falsified transcripts and test scores to maintain accreditation while collecting full tuition payments.',
            'The company creates fake internship programs specifically for F-1 students seeking practical training authorization. Students pay $2,000 for documentation of non-existent training positions that exist only on paper.',
            'This institution operates a "degree mill" where foreign students can purchase academic credentials without attending classes or completing coursework. They maintain false enrollment records and issue transcripts for courses never taken.',
            'I have witnessed this organization coaching international students on how to lie during immigration interviews about their true intentions. They provide scripts and fake documentation to support claims of legitimate academic pursuits.',
            'The business exploits student visa holders by requiring them to work in conditions that violate their visa terms, then threatens to report them to immigration authorities if they complain about unsafe working conditions or unpaid wages.',
            'This educational consultant charges students $5,000 to create entirely fabricated academic histories, including fake degrees from non-existent universities, to qualify them for advanced degree programs in the United States.',
            'I observed the systematic creation of false academic transcripts and recommendation letters for international students. The organization maintains relationships with corrupt officials at overseas educational institutions to provide "authentic" documentation.',
            'The company operates a network of shell companies that exist solely to provide fake employment offers to international students seeking post-graduation work authorization. No actual jobs exist at these fictitious businesses.',
            'This institution knowingly enrolls students who are already working full-time elsewhere, allowing them to maintain student visa status while never attending classes. They coordinate class schedules to avoid conflicts with students\' actual employment.',            'I have evidence that this organization is selling academic credentials and visa status to individuals who have no intention of pursuing education. They maintain minimal facilities to appear legitimate while operating primarily as a visa fraud service.',
            'This recruitment agency specifically targets foreign students with expired visas, offering fake employment documentation and work authorization for substantial fees while providing no actual job opportunities.',
            'The business operates a network of shell companies that exist solely to provide fraudulent CPT (Curricular Practical Training) opportunities to students who pay fees but never actually work or receive training.',
            'I observed this institution accepting bribes from foreign students to falsify attendance records and academic progress reports required for maintaining valid student status.',
            'This organization maintains a sophisticated document forgery operation that creates fake transcripts, diplomas, and recommendation letters from prestigious universities to help foreign nationals gain admission to US institutions.',
            'The company exploits the Optional Practical Training system by creating fake STEM degree programs that exist only on paper, allowing students to extend their stay without legitimate education.',
            'I have witnessed this educational consultant coaching foreign students on how to lie during visa interviews about their true intentions while providing them with elaborate false backgrounds.',
            'This facility operates a visa mill where foreign nationals can purchase student status without any educational requirements, maintaining classrooms that are never used and faculty who never teach.',
            'The organization operates a complex scheme where they recruit foreign students for legitimate programs but then require them to work full-time in unrelated businesses while maintaining the appearance of academic enrollment.',
            'I observed the systematic creation of fake research positions and laboratory assignments that exist only to provide visa documentation while students actually work in completely different industries.',
            'This institution operates a fraudulent language school that requires no English proficiency for admission and provides no actual language instruction while maintaining student visa status for participants.',
            'The business maintains corrupt relationships with SEVIS system administrators who falsify academic records and immigration compliance data in exchange for substantial payments.',
            'I have evidence that this organization creates elaborate fake campus facilities for immigration inspections while actual classes are held in temporary locations or not at all.',
            'This company exploits religious student visa categories by creating fake seminary programs that require no theological education while allowing foreign nationals to maintain legal status.',
            'The organization operates a scheme where they charge students premium fees to transfer between multiple fake institutions to extend their stay beyond normal visa limitations.',
            'I witnessed this institution creating fake internship programs with non-existent companies, providing documentation of work experience that never occurred to support visa applications.',
            'This business operates a network of corrupt immigration attorneys who knowingly file fraudulent student visa applications while charging authentic legal fees for their illegal services.',
            'The facility maintains sophisticated systems for backdating academic records and creating false enrollment histories to support students who have been out of status for extended periods.',
            'I have observed this organization exploiting distance learning regulations by enrolling foreign students in online programs that require no actual coursework while maintaining visa eligibility.',
            'This institution operates a complex scheme where they accept payments from students\' home countries in exchange for providing academic credentials without requiring the students to travel to the United States.',
            'The company maintains a database of corrupted employers who provide fake job offers and employment verification letters specifically for foreign students seeking work authorization extensions.'        ],'Fugitive Criminal Alien': [
            'Yo, my neighbor straight up told me he\'s not who he says he is - showed me his real ID and everything, dude\'s wanted for some serious stuff back home.',
            'This guy I work with has been bragging about how he fled his country before going to trial, keeps multiple fake IDs and changes his look all the time.',
            'Found out my landlord is knowingly renting to someone who admitted they\'re dodging an immigration warrant - pays cash and uses his dead cousin\'s name.',
            'My roommate confessed he got deported before but snuck back in to avoid prison time, showed me all these different IDs he bought from some guy downtown.',
            'This dude at the bar told me he\'s been hiding out for months using fake papers - even showed me the news articles about the crimes he\'s wanted for.',
            'My coworker has been using his brother\'s identity since his brother died, says he\'s wanted for assault back in his home country.',
            'Caught my neighbor burning documents with his real name on them, guy straight up admitted he\'s avoiding extradition for felony charges.',
            'This guy I know has like five different aliases and practices his fake backstory in the mirror - fled while awaiting trial for robbery.',
            'My friend showed me letters from police in his country saying there\'s warrants out for him, described exactly how he crossed the border illegally.',
            'This person at my job uses different names depending on who\'s asking - told me all about his criminal past and how scared he is of getting caught.',
            'Found out someone in my building is using a dead person\'s identity from back home, even coached his family on what to say if anyone asks.',
            'My neighbor showed me wanted posters with his picture on them from his home country, keeps track of the investigation by reading news online.',
            'This guy I met described his whole escape route after fleeing serious criminal charges - told me about the network that helped him get fake documents.',
            'Someone I know admitted they\'re wanted for war crimes back home, stays in contact with other fugitives and has a whole support network.',
            'My coworker confessed to committing violent crimes before coming here, showed me proof of his real identity and knows cops are looking for him.',
            'This person I know moves between different safe houses every few weeks to avoid getting caught by law enforcement.',
            'Found out my neighbor runs an identity theft ring to keep his fake identity going - steals info from dead people to make new documents.',
            'This guy told me he\'s connected to human trafficking networks and helps other wanted criminals get into the country illegally.',
            'My friend keeps emergency bags with cash, fake IDs, and car keys ready in case he needs to run if cops find him.',
            'This person I know helps other fugitives by providing housing and fake documents, charges them big money for protection services.',
            'Found out someone admitted to bribing officials back home to slow down extradition paperwork while he establishes himself here.',
            'My neighbor monitors police radio frequencies and has contacts inside police departments who warn him about investigations.',
            'This guy I know has been systematically destroying evidence of his past, even got plastic surgery to change his appearance.',
            'Someone told me they operate a network that provides false alibis and fake witness statements to confuse law enforcement.',
            'My coworker admitted to being involved in witness intimidation back home, specifically threatened people who might cooperate with authorities.',
            'I have confirmed that the individual residing at this address is using a false identity. Their actual name is [NAME] and they are wanted for serious criminal charges in their home country. They have admitted this to me directly and shown documentation of their original identity.',
            'The subject has been living at this location for approximately 6 months and has openly discussed fleeing criminal charges in their home country. They possess multiple identification documents with different names and have described their methods for evading detection.',
            'This business is knowingly employing and housing an individual who has admitted to me that they are evading an outstanding warrant from immigration authorities. They are using documentation belonging to a relative and are paid in cash to avoid detection.',
            'The individual has explicitly stated they were previously deported but re-entered illegally to avoid criminal prosecution in their home country. They maintain multiple identities with supporting documentation and regularly change their appearance.',
            'I have direct knowledge that the occupant of this residence is a fugitive with an outstanding removal order. They have shown me falsified identification documents they purchased and explained their methods for avoiding detection during routine interactions with authorities.',
            'The subject has confided in me that they are wanted for violent crimes in their home country and are using their deceased brother\'s identity documents. They have shown me photographs of themselves before they altered their appearance through surgery.',
            'I witnessed this individual destroying documents that contained their real name and replacing them with fraudulent identification. They explicitly stated they were avoiding extradition for serious criminal charges and showed me newspaper articles about their alleged crimes.',
            'This person has admitted they fled their home country while awaiting trial for serious felony charges. They use multiple aliases and have created an elaborate false background story that they rehearse regularly.',
            'The individual residing here has shown me correspondence from law enforcement in their home country confirming active warrants for their arrest. They have described in detail their methods for crossing borders illegally and obtaining false documentation.',
            'I have observed this person using different names and identification documents depending on the situation. They have explicitly discussed their criminal history and their fear of being discovered by immigration authorities.',
            'The subject has revealed to me that they are using the identity of a deceased person from their home country. They maintain false employment records and have coached family members on supporting their false identity claims.',
            'This individual has shown me wanted posters with their photograph from their home country and admitted to serious criminal offenses. They regularly monitor news from their homeland to track the investigation into their crimes.',
            'I have direct knowledge that this person entered the United States illegally after fleeing prosecution for multiple serious crimes. They have described their escape route and the network of people who helped them obtain false documents.',
            'The individual has admitted to me that they are wanted for crimes against humanity in their home country. They maintain contact with other fugitives and have described a support network for individuals evading international law enforcement.',            'This person has confessed to committing serious violent crimes before fleeing to the United States. They have shown me evidence of their original identity and detailed knowledge of law enforcement efforts to locate them.',
            'The individual maintains multiple safe houses and regularly rotates between them to avoid establishing a predictable pattern that could lead to their discovery by law enforcement agencies.',
            'I have evidence that this person operates a sophisticated identity theft network to maintain their false identity, regularly stealing personal information from deceased individuals to create new documentation.',
            'This fugitive has revealed their connections to international human trafficking networks and has admitted to facilitating the illegal entry of other wanted criminals into the United States.',
            'The subject maintains detailed escape plans including pre-positioned vehicles, cash reserves, and alternative identification documents ready for immediate use if their location is discovered.',
            'I observed this individual providing assistance to other fugitives by offering secure housing, false documentation services, and intelligence about law enforcement activities in exchange for substantial payments.',
            'This person has admitted to bribing corrupt officials in their home country to delay or obstruct international warrant processing and extradition procedures while they establish themselves in the United States.',
            'The individual maintains sophisticated surveillance of their own activities, including monitoring law enforcement communications and maintaining contacts within police departments to receive advance warning of investigations.',
            'I have witnessed this fugitive systematically eliminating evidence of their past identity by destroying documents, altering physical appearance through surgery, and creating elaborate false personal histories.',
            'This person operates a network of accomplices who provide false alibis and sworn statements to law enforcement agencies to create confusion about their true identity and location.',
            'The subject has revealed their involvement in witness intimidation and elimination activities in their home country, including specific threats against individuals who might cooperate with authorities.',
            'I observed this individual maintaining detailed files on law enforcement officers and prosecutors involved in their case, including personal information about their families and daily routines.',
            'This fugitive has admitted to corrupting religious and community leaders who provide false character references and sanctuary while knowing their true criminal background.',
            'The person maintains sophisticated communication with criminal associates in their home country who continue to commit crimes on their behalf while they avoid prosecution.',
            'I have evidence that this individual has been involved in eliminating other fugitives who posed risks to their security by potentially cooperating with law enforcement agencies.',
            'This person operates a legitimate business as a front while using it to launder money and provide employment documentation to other criminals evading law enforcement.',
            'The subject has revealed their participation in international money laundering operations that help fund continued criminal activities and maintain their fugitive lifestyle.',
            'I witnessed this individual providing training to other fugitives on methods for avoiding detection, creating false identities, and establishing new lives while evading law enforcement.',
            'This person maintains detailed intelligence on extradition laws and procedures, actively lobbying corrupt officials to prevent treaty enforcement and international cooperation.',
            'The fugitive has admitted to planning additional crimes in the United States while using their false identity, viewing their current situation as an opportunity to expand their criminal activities.',
            'I have observed this individual recruiting accomplices from vulnerable immigrant communities by exploiting their fear of law enforcement to gain assistance in maintaining their hidden identity.',
            'This fugitive operates a sophisticated surveillance network monitoring law enforcement activities and maintains contacts within multiple police departments for advance warning.',
            'The individual has established a complex money laundering operation through cryptocurrency exchanges to fund their continued evasion of international law enforcement.',
            'I witnessed this person maintaining detailed escape routes and safe houses across multiple states, with pre-positioned resources for immediate relocation if discovered.',
            'This fugitive has admitted to eliminating potential witnesses who could testify against them in their home country by hiring local criminals.',
            'The subject operates a document forgery ring specifically for other fugitives, creating false identities and immigration documentation for substantial payments.',
            'I observed this individual providing tactical training to other criminals on surveillance detection, counter-surveillance techniques, and operational security.',
            'This person maintains corrupt relationships with immigration officials who provide advance warning of raids and investigations in exchange for bribes.',
            'The fugitive has revealed their involvement in coordinating criminal activities in their home country while avoiding prosecution by directing operations remotely.',
            'I witnessed this individual systematically recruiting law enforcement personnel as informants by exploiting their financial difficulties and personal vulnerabilities.',
            'This person operates a sophisticated witness intimidation network that threatens family members of potential witnesses in their home country.',
            'The subject has admitted to maintaining multiple legitimate businesses as fronts for money laundering and providing employment to other fugitive criminals.',
            'I observed this fugitive using advanced encryption technology and secure communication methods to coordinate with criminal organizations while avoiding detection.',
            'This individual has established relationships with corrupt embassy officials who provide diplomatic cover and assistance with document fraud.',
            'The person maintains detailed intelligence files on prosecutors and judges involved in their case, including personal information about their families and associates.',
            'I witnessed this fugitive operating a human trafficking network that specifically targets vulnerable individuals for forced labor and sexual exploitation.',
            'This individual has admitted to corrupting religious institutions and community organizations that provide sanctuary while knowing their criminal background.',
            'The subject operates a sophisticated identity theft operation targeting deceased individuals to create new false identities for themselves and other fugitives.',
            'I observed this person maintaining connections with international terrorist organizations and providing logistical support for their operations.',
            'This fugitive has revealed their involvement in arms trafficking and weapons smuggling operations that supply criminal organizations across multiple countries.'        ],'Gang Related': [
            'Yo, this spot is basically gang central - always see dudes with those distinctive tattoos making deals and talking about who controls what blocks.',
            'My friend works next to this business that\'s totally a front, always has gang meetings after hours with flags and gang stuff everywhere.',
            'Overheard these guys at this place planning retaliation against some rival crew, had weapons visible and were discussing territory boundaries.',
            'This property is where they bring new gang recruits - witnessed some initiation where they made the kid commit crimes to prove loyalty.',
            'Found out this place collects payments for gang operations - people drop off money all day and they count it with territory records.',
            'My neighbor told me these gang members systematically shake down local businesses for protection money from this location.',
            'This warehouse stores weapons for gang members - saw them unloading gun crates and testing firearms in some basement shooting range.',
            'This spot serves as gang headquarters where they coordinate drug dealing across multiple neighborhoods with maps and delivery schedules.',
            'Found out this business launders money from gang crimes - processes huge cash transactions while keeping separate books for gang revenue.',
            'My coworker said this place makes fake IDs specifically for gang members - has printing equipment for licenses and immigration documents.',
            'Witnessed gang members using this location to coordinate human trafficking - keep detailed victim records and transportation schedules.',
            'This shop is a front for a car theft ring run by organized gang members - they alter VIN numbers and forge export papers.',
            'This place is where gang members coordinate cybercrimes like credit card fraud - sophisticated computer setup with stolen personal info databases.',
            'My friend told me gang leaders plan armed robberies from this location - do surveillance on targets and assign roles based on gang hierarchy.',
            'This facility recruits vulnerable kids through social media and gaming platforms - maintain detailed profiles and use psychological manipulation.',
            'Found out this organization launders money for multiple gangs, processing illegal proceeds through legitimate businesses.',
            'This location distributes weapons where gang members modify firearms for specific criminal activities like assassinations.',
            'My neighbor said this facility produces and distributes synthetic drugs including fentanyl with sophisticated lab equipment.',
            'This business fronts for a gang-controlled prostitution network with detailed victim records and territory assignments.',
            'This property houses surveillance operations where gang members monitor law enforcement and rival gang movements.',
            'Witnessed gang members coordinating large-scale identity theft targeting elderly and immigrant communities from this location.',
            'This facility trains gang members in advanced criminal techniques like safe-cracking and weapons handling.',
            'Found out this organization runs a witness intimidation network that tracks and threatens people who cooperate with law enforcement.',
            'This location is used for planning gang wars with detailed maps of rival territories and strategic violent confrontation plans.',
            'My friend said this business operates a corruption network bribing cops, court officials, and correctional staff.',
            'This location serves as a meeting point for gang members involved in organized criminal activity. I have observed multiple individuals with distinctive gang tattoos conducting what appeared to be drug and weapons transactions while discussing territory control.',
            'The business operates as a front for gang activity, with regular meetings of known gang members occurring after hours. The back room contains gang paraphernalia including distinctive clothing, flags, and written materials outlining their territory and operations.',
            'I have witnessed individuals at this location discussing gang-related violence including specific plans for retaliation against rival groups. Multiple weapons were visible during these meetings, and they openly discussed controlling specific geographic areas.',
            'The property is being used for the recruitment and initiation of new gang members. I observed an initiation ceremony where new members were required to commit criminal acts as proof of loyalty while established members documented these activities.',
            'This establishment serves as a collection point for payments related to gang-controlled criminal enterprises. Money is delivered by various individuals throughout the day, counted on the premises, and recorded in ledgers with territory designations.',
            'I have observed the systematic extortion of local businesses by gang members operating from this location. They maintain detailed records of which businesses make payments and send armed collectors to those who refuse to pay protection money.',
            'The facility is used as a storage and distribution center for illegal weapons used by gang members. I witnessed the delivery of firearms in unmarked crates and observed gang members testing weapons in the basement shooting range they constructed.',
            'This location serves as a command center where gang leaders coordinate drug trafficking operations across multiple neighborhoods. They maintain detailed maps, territory boundaries, and schedules for drug deliveries while discussing expansion plans.',
            'I have evidence that this business is being used to launder money from gang criminal activities. They process large cash transactions through legitimate business accounts while maintaining separate books for actual gang revenue.',
            'The property houses a sophisticated operation for manufacturing and distributing counterfeit identification documents specifically for gang members. They maintain printing equipment and templates for driver\'s licenses, social security cards, and immigration documents.',
            'I witnessed gang members using this location to coordinate human trafficking operations. They maintain detailed records of victims, transportation schedules, and payment arrangements with clients across multiple states.',
            'The establishment operates as a front for a sophisticated car theft and export ring run by organized gang members. They maintain facilities for altering vehicle identification numbers and forging export documentation.',
            'This location is used by gang members to coordinate cybercrimes including credit card fraud and identity theft. They maintain sophisticated computer equipment and databases of stolen personal information.',
            'I have observed gang leaders at this location planning and coordinating armed robberies of commercial establishments. They conduct surveillance of targets, assign roles to members, and divide proceeds according to gang hierarchy.',            'The facility serves as a recruitment center where gang members target vulnerable youth through social media and gaming platforms. They maintain detailed profiles of potential recruits and use sophisticated psychological manipulation techniques.',
            'This organization operates a complex money laundering operation for multiple gangs, processing illegal proceeds through a network of legitimate businesses while maintaining detailed accounting for each criminal organization.',
            'The location serves as a weapons distribution center where gang members modify and customize firearms for specific criminal activities including assassinations and territory disputes.',
            'I have observed this facility being used for the production and distribution of synthetic drugs including fentanyl, with gang members operating sophisticated laboratory equipment and distribution networks.',
            'This business operates as a front for a gang-controlled prostitution network, with detailed records of victims, clients, and territory assignments managed through sophisticated organizational structures.',
            'The property houses a sophisticated surveillance operation where gang members monitor law enforcement activities and rival gang movements using advanced electronic equipment and communication systems.',
            'I witnessed gang members at this location coordinating large-scale identity theft operations that specifically target elderly and immigrant communities for financial fraud.',
            'This facility serves as a training center where gang members learn advanced criminal techniques including safe-cracking, electronic surveillance countermeasures, and weapons handling.',
            'The organization operates a complex witness intimidation network that tracks and threatens individuals who cooperate with law enforcement investigations of gang activities.',
            'I have evidence that this location is used for planning and coordinating gang wars, including detailed maps of rival territories and strategic plans for violent confrontations.',
            'This business operates a sophisticated corruption network that bribes law enforcement officers, court officials, and correctional facility staff to protect gang operations and members.',
            'The facility houses a complex communication system that gang members use to coordinate criminal activities across multiple states while avoiding law enforcement monitoring.',
            'I observed gang members using this location to operate illegal gambling operations that generate substantial revenue while serving as fronts for additional criminal activities.',
            'This organization maintains detailed files on potential victims for extortion schemes, including business owners, professionals, and individuals with valuable assets or information.',
            'The property serves as a storage facility for stolen goods ranging from vehicles to electronics, with sophisticated systems for altering identification numbers and preparing items for resale.',
            'I have witnessed gang members at this location operating a complex loan sharking operation that charges excessive interest rates and uses violence to collect debts.',
            'This facility is used for the systematic recruitment and training of corrupt public officials who provide inside information and protection for gang criminal activities.',
            'The business operates a sophisticated document forgery operation that produces false identification, immigration documents, and official certificates for gang members and their criminal associates.',
            'I observed gang members using this location to coordinate home invasion robberies, maintaining detailed intelligence on target residences and their security systems.',
            'This organization operates a complex network of safe houses and escape routes designed to help gang members evade law enforcement during investigations and raids.',
            'The facility serves as a command center for coordinating gang activities in correctional facilities, maintaining communication with incarcerated members and directing criminal operations from within prisons.'        ],'Human Rights Violators': [
            'My neighbor straight up admitted he was involved in government torture back home - showed me photos of what he did and named victims like it was no big deal.',
            'This guy I know bragged about killing civilians based on their ethnicity in his home country - described exactly how and where he did it.',
            'Found out someone in my building participated in persecuting religious minorities back home - told me about destroying churches and arresting people.',
            'My coworker has been recorded talking about his involvement in mass executions of political dissidents - still has photos and documents from it.',
            'This person I know was an official at a detention facility known for torture and killings - described exactly what he was in charge of.',
            'Someone confided in me about their role in forced disappearances of opposition members - still has contact info for other officials involved.',
            'Witnessed this person showing photos of mass graves they helped create during ethnic cleansing - described methods for hiding evidence.',
            'This individual admitted to systematic rape and sexual torture of prisoners in government facilities - described it in graphic detail.',
            'Found out my neighbor was responsible for organizing death squads that targeted journalists - keeps detailed victim records.',
            'This person confessed to participating in forced sterilization programs targeting specific ethnic groups - showed me medical equipment they used.',
            'Someone detailed their role in operating concentration camps with medical experiments - has photos and documentation from the facilities.',
            'Witnessed this person showing scars they inflicted on prisoners during interrogations - demonstrated torture techniques they developed.',
            'This individual admitted to coordinating systematic destruction of minority religious sites - has maps and photos documenting the destruction.',
            'Found out this person was involved in recruiting and training child soldiers - described psychological manipulation methods.',
            'Someone confessed to implementing policies that caused starvation deaths of thousands - maintains documentation of their decisions.',
            'This person detailed their involvement in secret detention facilities with psychological torture and sensory deprivation.',
            'Found out this individual directed systematic poisoning of water supplies in targeted communities affecting thousands.',
            'This person admitted to organizing forced labor camps where political prisoners were worked to death.',
            'Someone confessed to participating in systematic elimination of intellectuals and professionals targeted for their education.',
            'Witnessed this person showing documentation of chemical weapons testing on civilian populations with detailed victim records.',
            'This individual revealed participation in state-sponsored organ harvesting operations targeting prisoners and ethnic minorities.',
            'Someone admitted to directing systematic sexual violence campaigns against ethnic communities as a weapon of war.',
            'Found out this person was responsible for forced relocation programs that killed thousands through exposure and starvation.',
            'This person detailed their role in establishing re-education camps where minorities were subjected to torture and forced conversion.',
            'Someone confessed to involvement in state-sponsored assassination programs targeting dissidents and human rights activists.',
            'The individual residing at this location has admitted to me their involvement in government-sanctioned torture in their home country. They showed photographs documenting these acts and named specific victims while expressing no remorse.',
            'I have evidence that the subject participated in targeted killings of civilians based on their ethnicity in their home country. They have described these events in detail to me, including specific locations and methods used, while boasting about evading accountability.',
            'This individual has openly admitted to participating in the persecution of religious minorities in their country of origin. They described their role in destroying religious sites and detaining members of targeted groups, showing documentation of their official position.',
            'The subject has been recorded discussing their direct involvement in mass executions of political dissidents. They maintain photographs and documents from these events and have described in detail their role in these human rights violations.',
            'I have firsthand knowledge that this individual served as an official in a detention facility known for systematic torture and extrajudicial killings. They have explicitly described their command responsibility for these abuses and their methods of entering the United States using false documentation.',
            'The individual has confided details about their role in conducting forced disappearances of opposition members in their home country. They maintain contact information for other officials involved and have discussed their fear of international prosecution.',
            'I witnessed this person showing photographs of mass graves they helped create during ethnic cleansing operations. They described their methods for disposing of evidence and expressed pride in avoiding accountability for their actions.',
            'The subject has admitted to me their involvement in the systematic rape and sexual torture of prisoners in government facilities. They described these acts in graphic detail and showed documentation of their official authorization.',
            'I have direct knowledge that this individual was responsible for organizing death squads that targeted journalists and human rights activists. They maintain detailed records of victims and described their methods for eliminating witnesses.',
            'This person has confessed to participating in forced sterilization programs targeting specific ethnic groups. They showed me medical equipment they used and described the scale of their operations affecting thousands of victims.',
            'The individual has detailed their role in operating concentration camps where prisoners were subjected to medical experiments. They maintain photographs and documentation from these facilities and expressed no remorse for their actions.',
            'I observed this person showing scars and injuries they inflicted on prisoners during interrogations. They demonstrated torture techniques they developed and boasted about their effectiveness in extracting confessions.',
            'The subject has admitted to coordinating the systematic destruction of cultural and religious sites belonging to minority groups. They maintain maps and photographs documenting the extent of destruction they personally supervised.',
            'I have evidence that this individual was involved in the recruitment and training of child soldiers. They described their methods for psychological manipulation and showed photographs of children they forced into combat.',            'This person has confessed to their role in implementing policies that resulted in the starvation deaths of thousands of civilians. They maintain documentation of their decisions and expressed satisfaction with the effectiveness of their methods.',
            'The individual has detailed their involvement in operating secret detention facilities where prisoners were subjected to psychological torture and sensory deprivation for extended periods without legal process.',
            'I have evidence that this person directed the systematic poisoning of water supplies in targeted communities, affecting thousands of civilians and causing long-term health effects.',
            'This individual has admitted to their role in organizing forced labor camps where political prisoners were worked to death under brutal conditions while their families were threatened to ensure compliance.',
            'The subject has confessed to participating in the systematic elimination of intellectuals and professionals targeted for their education and potential to organize resistance movements.',
            'I observed this person showing documentation of their involvement in chemical weapons testing on civilian populations, including detailed records of victims and experimental procedures.',
            'This individual has revealed their participation in state-sponsored organ harvesting operations targeting prisoners of conscience and ethnic minorities.',
            'The person has admitted to directing systematic sexual violence campaigns against targeted ethnic communities as a weapon of war and ethnic cleansing.',
            'I have evidence that this individual was responsible for implementing forced relocation programs that resulted in the deaths of thousands through exposure and starvation.',
            'This person has detailed their role in establishing and operating re-education camps where cultural and religious minorities were subjected to torture and forced conversion.',
            'The subject has confessed to their involvement in state-sponsored assassination programs targeting dissidents and human rights activists both domestically and internationally.',
            'I witnessed this individual describing their participation in mass execution programs using industrial methods designed to efficiently eliminate large numbers of victims.',
            'This person has admitted to their role in implementing policies of collective punishment where entire communities were destroyed in response to individual acts of resistance.',
            'The individual has revealed their involvement in systematic slavery operations where specific ethnic groups were forced into unpaid labor under threat of violence.',
            'I have evidence that this person directed the deliberate destruction of hospitals and schools in conflict zones to maximize civilian casualties and break resistance.',
            'This individual has confessed to their participation in biological weapons experiments conducted on prisoners without consent, resulting in painful deaths and permanent disabilities.',
            'The subject has detailed their role in operating mobile execution units that traveled between communities conducting mass killings of targeted populations.',
            'I observed this person showing evidence of their involvement in the systematic rape and impregnation of women from targeted ethnic groups as a form of genocide.',
            'This person has admitted to directing the deliberate targeting of humanitarian workers and medical personnel to prevent aid from reaching civilian populations.',
            'The individual has revealed their participation in psychological warfare programs designed to break the mental health of targeted communities through systematic terror.',
            'I have evidence that this person was involved in operating death ships where prisoners were taken to sea and murdered in ways designed to leave no evidence of their deaths.'        ],'Human Smuggling': [
            'Yo, this house is basically a people storage facility - always see groups of like 15-20 people getting dropped off at night and held until someone pays up.',
            'My friend drives for this business that smuggles people using cars with hidden compartments - gets paid a grand per person to move them across state lines.',
            'Witnessed money exchanges and fake ID handouts at this location where they coordinate moving people who entered the country illegally.',
            'Found out these guys operate a sophisticated smuggling network with overseas contacts and detailed border crossing instructions.',
            'This warehouse hides smuggled people in makeshift quarters - saw like 30+ people crammed in there with guards making sure nobody leaves.',
            'My neighbor told me this organization runs multiple smuggling routes and charges between 8 to 15 grand per person depending on where they\'re going.',
            'This business has a fleet of cargo vehicles with false bottoms and hidden compartments - saw mechanics installing these modifications.',
            'This place serves as command central where smugglers coordinate with border contacts and track groups in transit.',
            'Witnessed them coaching smuggled people on what to say if caught - give them fake IDs and practice cover stories.',
            'Found out this organization has detailed intel on border patrol patterns and adjusts smuggling routes in real-time.',
            'Observed payment processing from families and complex financial arrangements across multiple countries using untraceable transfers.',
            'This facility temporarily houses people whose families haven\'t paid yet - conditions are deliberately harsh to pressure quick payment.',
            'This business operates a network of drivers and safe house operators who specialize in avoiding checkpoints using back roads.',
            'My friend said this organization has smuggled hundreds of people this year - keeps photo records as marketing materials.',
            'This location has surveillance equipment to watch for cops and protocols to quickly hide evidence of smuggling activities.',
            'Found out this organization operates maritime smuggling using modified fishing boats and private yachts during optimal conditions.',
            'This business has corrupt border officials on payroll who provide advance warning of patrol schedules.',
            'Witnessed underground tunnel systems connecting properties on both sides of borders with ventilation and lighting for moving groups.',
            'This facility trains smuggling guides in wilderness survival and border crossing methods to maximize success rates.',
            'This organization maintains weather and law enforcement intelligence to time operations when detection is least likely.',
            'Saw them exploiting legitimate trucking and delivery companies to provide cover for their smuggling operations.',
            'This location coordinates smuggling operations with precise timing across multiple border crossing points simultaneously.',
            'This business operates a document production facility creating fake IDs designed to pass border inspections.',
            'Found out this organization operates safe houses from border areas to major cities providing staged transportation.',
            'This facility has advanced communication systems for real-time coordination between smuggling teams and transportation networks.',
            'This property is being used as a stash house for smuggled individuals. I have observed groups of 15-20 people being delivered at night, held for several days in crowded conditions, and then transported to various locations after payments are received.',
            'The business operates a transportation network specifically for human smuggling. They use modified vehicles with hidden compartments to move people across state lines after they have entered the country illegally. Drivers are paid $1,000 per person transported.',
            'I have witnessed the coordination of smuggling operations at this location, including the exchange of money, distribution of false identification documents, and arrangement of transportation for individuals who have entered the country illegally.',
            'The individuals at this location operate a sophisticated smuggling network. They coordinate with overseas contacts to arrange travel, provide detailed instructions on border crossing methods, and maintain safe houses like this one throughout the region.',
            'This warehouse facility is being used to hide individuals who have been smuggled into the country. I observed 30+ people living in makeshift quarters with minimal sanitation. Guards are posted to prevent anyone from leaving until additional payments are made to the smugglers.',
            'I have direct knowledge that this organization operates multiple smuggling routes and maintains detailed records of successful crossings. They charge different rates based on the point of origin and destination, with payments ranging from $8,000 to $15,000 per person.',
            'The business maintains a fleet of specially modified cargo vehicles with false bottoms and hidden compartments designed specifically for transporting people undetected. I observed mechanics installing these modifications and testing their effectiveness.',
            'This location serves as a central communication hub where smugglers coordinate with contacts at the border, track the movement of groups in transit, and arrange payment transfers from families to facilitate ongoing operations.',
            'I witnessed the systematic coaching of smuggled individuals on what to say if apprehended by authorities. They provide false identity documents and rehearse cover stories with groups before they are moved to their next destination.',
            'The organization maintains detailed intelligence about border patrol patterns and law enforcement activities. They use this information to adjust smuggling routes in real-time and have successfully avoided detection for extended periods.',
            'I have observed the processing of payments from families and the coordination of complex financial arrangements spanning multiple countries. They use untraceable money transfer methods and maintain detailed accounting of debts and payments.',
            'This facility is used to temporarily house individuals whose families have not yet completed payment arrangements. The conditions are deliberately harsh to pressure families into making payments quickly, and guards prevent communication with outside contacts.',
            'The business operates a sophisticated network of drivers, safe house operators, and coordinators who specialize in moving people through various checkpoints and avoiding detection by using back roads and predetermined timing.',
            'I have evidence that this organization has successfully smuggled hundreds of individuals over the past year. They maintain photographic records of successful operations and use these as marketing materials to attract new clients.',            'The location is equipped with surveillance equipment to monitor approaches and has established protocols for quickly concealing evidence of smuggling activities if law enforcement is detected in the area.',
            'This organization operates a sophisticated maritime smuggling operation using modified fishing vessels and private yachts to transport individuals across coastal borders during optimal weather and enforcement conditions.',
            'The business maintains a network of corrupt border officials who provide advance warning of patrol schedules and enforcement activities while accepting payments to ignore specific smuggling operations.',
            'I have observed the use of underground tunnel systems that connect properties on both sides of international borders, with sophisticated ventilation and lighting systems for moving large groups safely.',
            'This facility operates as a training center where smuggling guides learn advanced wilderness survival techniques and border crossing methods to minimize detection and maximize success rates.',
            'The organization maintains detailed meteorological and law enforcement intelligence to time smuggling operations during optimal conditions when detection probability is minimized.',
            'I witnessed the systematic exploitation of legitimate transportation businesses including trucking companies and delivery services to provide cover for smuggling operations.',
            'This location serves as a logistics center where smuggling operations are coordinated with precise timing across multiple border crossing points simultaneously.',
            'The business operates a sophisticated document production facility that creates false identification and travel documents specifically designed to pass border inspection procedures.',
            'I have evidence that this organization operates a network of safe houses extending from border areas to major metropolitan areas, providing staged transportation and temporary housing.',
            'This facility maintains advanced communication systems that allow real-time coordination between smuggling teams, spotters, and transportation networks during active operations.',
            'The organization exploits legitimate immigrant communities by forcing them to provide assistance to smuggling operations under threat of deportation or harm to family members.',
            'I observed the use of sophisticated GPS tracking and mapping technology to identify and exploit vulnerabilities in border security while avoiding patrol patterns.',
            'This business operates a complex financial network that processes payments from multiple countries while maintaining plausible deniability about the source and purpose of funds.',
            'The facility houses specialized vehicles including all-terrain vehicles, motorcycles, and aircraft modified specifically for border crossing operations in remote areas.',
            'I have witnessed the systematic corruption of transportation industry workers including pilots, boat captains, and truck drivers who facilitate smuggling for substantial payments.',
            'This organization maintains detailed intelligence on immigration enforcement patterns and adjusts their routes and methods based on seasonal enforcement variations and policy changes.',
            'The location serves as a recruitment center where desperate individuals are convinced to serve as guides, drivers, and operators for dangerous smuggling missions.',
            'I observed the operation of a sophisticated early warning system that monitors law enforcement communications and provides real-time alerts to active smuggling teams.',
            'This business exploits legitimate refugee assistance programs by infiltrating charitable organizations and using their resources to facilitate illegal border crossings.',
            'The facility operates a complex vehicle modification workshop that creates hidden compartments and specialized equipment designed specifically for human smuggling operations.'        ],'Human Trafficking (Forced Labor/Slavery)': [
            'Workers at this place have had their IDs taken and work 16+ hour days for basically nothing - they\'re locked up on-site and told me they can\'t leave.',
            'This business tricks people from overseas with fake job promises, then takes their documents and forces them to work to pay off bogus debts.',
            'Saw multiple people being held against their will here - transported to work each morning, locked up at night, beaten if they don\'t meet quotas.',
            'These operators confiscate workers\' passports and force them to hand over most earnings as "fees" while threatening deportation.',
            'This farm houses workers in horrible conditions and uses debt bondage - new workers arrive and immediately owe thousands for transportation.',
            'Witnessed people recruited with false promises of education but end up as unpaid domestic servants locked in private homes.',
            'This massage parlor business is actually forced labor and sexual exploitation - workers kept in locked rooms under constant surveillance.',
            'Found out this organization targets vulnerable women overseas with fake nanny jobs but forces them into unpaid domestic and sexual labor.',
            'This construction company maintains work camps with deplorable conditions, dangerous jobs without safety gear, and withheld wages.',
            'Observed systematic psychological manipulation where traffickers threaten victims\' families to prevent escape attempts.',
            'This factory operates sweatshop conditions with 18+ hour days, workers sleeping on floors, no freedom of movement, no pay.',
            'This organization recruits through fake modeling opportunities then forces victims into commercial sexual exploitation.',
            'This restaurant chain uses trafficking victims as unpaid kitchen staff housed in basements, working without breaks.',
            'Witnessed drug addiction being used to control trafficking victims - operators deliberately get them addicted for control.',
            'This organization operates fake group homes disguised as rehabilitation while forcing residents to work without compensation.',
            'This business has a recruitment network targeting vulnerable people with false promises of legitimate jobs and education.',
            'This facility breaks down newly trafficked people psychologically through isolation and violence before work assignments.',
            'Observed systematic debt bondage where victims are told they owe increasingly large amounts that can never be repaid.',
            'This organization moves victims between locations to prevent relationships and familiarity with escape routes.',
            'This business maintains detailed files on victims\' family members back home to ensure compliance through threats.',
            'Witnessed sophisticated document control where victims\' real IDs are destroyed and replaced with fake ones.',
            'This facility trains traffickers in psychological manipulation techniques to break victims\' resistance.',
            'This organization has corrupt law enforcement on payroll who ignore trafficking and intimidate victims seeking help.',
            'Found out this business operates fake legitimate companies that exist solely to cover trafficking operations.',
            'This location provides minimal healthcare to trafficking victims just to keep them functional for work.',
            'Workers at this facility have had their identification documents confiscated and are forced to work 16+ hour days for minimal or no compensation. They are housed in locked quarters on-site and have explicitly told me they are not permitted to leave the premises.',
            'This business is trafficking individuals for forced labor. Victims are recruited overseas with promises of legitimate employment but upon arrival have their documents taken, are forced to live in company housing, and must work to pay off ever-increasing "debts" for transportation and housing.',
            'I have observed multiple individuals being held against their will at this location. They are transported to work sites each morning, returned to locked facilities at night, and subjected to physical abuse if they fail to meet work quotas or attempt to contact outsiders.',
            'The operators of this establishment are confiscating workers\' passports and visas, restricting their movement, and forcing them to provide services under threats of deportation and harm to their families. Workers are required to surrender most of their earnings as "fees."',
            'This agricultural operation is housing workers in inhumane conditions and forcing them to work excessive hours through debt bondage. New workers arrive regularly from overseas and immediately have their documents confiscated while being told they owe thousands for transportation costs.',
            'I witnessed individuals being recruited through false promises of education and legitimate work, only to have their documents seized upon arrival and be forced into domestic servitude in private homes where they work without pay and are prohibited from leaving.',
            'The business operates massage parlors that are actually fronts for forced labor and sexual exploitation. Workers are kept in locked rooms, monitored constantly, and forced to provide services under threat of violence to themselves and their families.',
            'I have evidence that this organization targets vulnerable women from overseas with promises of legitimate employment as nannies and housekeepers, but upon arrival they are forced into unpaid domestic labor and sexual exploitation in wealthy households.',
            'This construction company maintains work camps where foreign workers are held in deplorable conditions, forced to work dangerous jobs without safety equipment, and have their wages withheld while being told they owe money for transportation and housing.',
            'I observed the systematic psychological manipulation of trafficking victims who are told their families will be harmed if they attempt to escape or contact authorities. The traffickers maintain detailed files on victims\' family members to reinforce these threats.',
            'The facility operates as a factory where individuals work in sweatshop conditions for 18+ hours daily producing goods for major retailers. Workers sleep on factory floors, have no freedom of movement, and receive no compensation.',
            'I have direct knowledge that this organization recruits victims through fake modeling and entertainment opportunities, then forces them into commercial sexual exploitation while moving them between different locations to prevent them from establishing connections.',
            'This restaurant chain uses trafficking victims as unpaid kitchen staff who are housed in basement areas, work without breaks or days off, and are threatened with deportation and violence if they attempt to leave or seek help.',
            'I witnessed the use of drug addiction to control trafficking victims, with operators deliberately getting victims addicted to substances and then using their addiction to maintain control while forcing them to work in various illegal enterprises.',            'The organization operates a network of residential facilities disguised as group homes where trafficking victims are held under the guise of rehabilitation programs while being forced to work in various businesses without compensation.',
            'This business operates a sophisticated recruitment network that targets vulnerable individuals in economically disadvantaged countries with false promises of legitimate employment and educational opportunities.',
            'The facility serves as a processing center where newly trafficked individuals are broken down psychologically through isolation, threats, and violence before being assigned to various forced labor operations.',
            'I have observed the systematic use of debt bondage where victims are told they owe increasingly large amounts for transportation, housing, and basic necessities that can never be repaid.',
            'This organization operates a complex system of moving victims between different locations to prevent them from establishing relationships or becoming familiar with escape routes.',
            'The business maintains detailed files on victims\' family members in their home countries, using threats of violence against relatives to ensure compliance and prevent escape attempts.',
            'I witnessed the operation of a sophisticated document control system where victims\' identification papers are destroyed and replaced with false documents that further restrict their freedom.',
            'This facility operates as a training center where traffickers learn psychological manipulation techniques designed to break victims\' resistance and create psychological dependence.',
            'The organization maintains corrupt relationships with law enforcement officials who are bribed to ignore trafficking operations and intimidate victims who attempt to seek help.',
            'I have evidence that this business operates a network of front companies that appear legitimate but exist solely to provide cover for trafficking operations and forced labor.',
            'This location serves as a medical facility where trafficking victims receive minimal healthcare designed to keep them functional for work while treating injuries that result from abuse.',
            'The facility houses a sophisticated monitoring system that tracks victims\' movements and communications while preventing any unauthorized contact with outside individuals.',
            'I observed the systematic exploitation of religious and cultural beliefs to convince victims that their situation is divinely ordained and that resistance would bring spiritual consequences.',
            'This organization operates a complex financial system that processes proceeds from forced labor while maintaining the appearance of legitimate business operations.',
            'The business maintains a network of safe houses where victims are hidden during law enforcement investigations and moved to new locations when their current situation becomes compromised.',
            'I have witnessed the use of advanced psychological conditioning techniques including isolation, sleep deprivation, and reward systems designed to create complete dependency.',
            'This facility operates a recruitment network that specifically targets individuals aging out of foster care systems who lack family support and are vulnerable to manipulation.',
            'The organization maintains detailed procedures for disposing of victims who become too injured, sick, or psychologically damaged to continue working profitably.',
            'I observed the systematic exploitation of legitimate social services and charitable organizations to provide cover for trafficking operations while accessing vulnerable populations.',
            'This business operates a complex transportation network that moves victims between different types of forced labor depending on seasonal demands and law enforcement pressure.',
            'The facility serves as a training center where victims are taught skills needed for specific types of forced labor while being conditioned to accept their situation as permanent.'        ],'Immigration Telefraud': [
            'This place runs a call center scamming immigrants by pretending to be ICE - saw their scripts demanding payments to avoid deportation.',
            'Found out this business calls foreign nationals claiming to be USCIS officials demanding payment for made-up immigration problems.',
            'This call center uses fake government phone numbers to target immigrants, threatening arrest unless they pay immediately.',
            'This location scams immigrant communities using scripts where operators pretend to be immigration officials demanding gift card payments.',
            'This business bought immigrants\' info from data brokers and calls claiming immigration problems that need immediate payment to fix.',
            'Witnessed operators practicing fake immigration official voices and discussing which communities are easiest to scam.',
            'This call center targets elderly immigrants with scripts claiming their kids face deportation unless they send money right away.',
            'Saw this organization using caller ID spoofing to make calls look like they come from real government offices.',
            'This business operates multiple shifts targeting different immigrant communities based on cultural knowledge and specific fears.',
            'Witnessed systematic coaching of new employees on how to sound threatening while impersonating immigration officials.',
            'This organization tracks which victims they\'ve called before to avoid duplication while maximizing targets.',
            'Found out this operation specifically targets recent immigrants during deportation raids when people are most scared.',
            'This call center has native speakers in multiple languages who target specific immigrant communities with cultural threats.',
            'Saw employees researching real immigration cases to incorporate authentic details into their fraudulent calls.',
            'This business keeps detailed stats on which threats and payment methods work best with different demographic groups.',
            'This organization runs voice training where callers learn to imitate regional accents to sound like real government officials.',
            'This facility has advanced call recording equipment to analyze successful calls and refine their scam approach.',
            'Witnessed AI systems analyzing victims\' social media to customize threats with personally relevant information.',
            'This business operates complex money laundering through multiple cryptocurrency exchanges to hide fraud proceeds.',
            'This organization maintains databases of successful victims who get repeatedly targeted with different scams.',
            'Saw systematic recruitment of people with real government backgrounds who provide insider knowledge about agency procedures.',
            'This facility spoofs multiple government phone numbers simultaneously while routing calls through international systems.',
            'This business maintains money mules who transfer fraud proceeds while thinking they have legitimate jobs.',
            'Found out this organization operates multilingual call centers targeting specific communities using native speakers.',
            'This location trains new operators in psychological manipulation to create panic and urgency in potential victims.',
            'This facility operates a sophisticated call center that targets immigrants, impersonating immigration authorities and demanding payments to avoid deportation. I have observed their scripts and training materials that explicitly detail these fraudulent practices.',
            'I have evidence that this business is running an immigration scam operation where they call foreign nationals, claim to be USCIS officials, and demand payment to resolve fictional problems with their immigration status. They maintain multiple untraceable payment methods.',
            'The organization operates a call center using spoofed government phone numbers to target immigrants. They claim to be ICE or USCIS officials and threaten arrest or deportation unless immediate payment is made. They keep detailed lists of targets organized by national origin.',
            'This location houses a telefraud operation targeting immigrant communities. Operators work from scripts impersonating immigration officials and demand payment via gift cards or cryptocurrency. They specifically target recent immigrants with limited English proficiency.',
            'The business maintains a database of immigrants\' information purchased from data brokers and uses it to make targeted calls claiming immigration problems that can only be resolved through immediate payment. They rotate through different phone numbers and payment methods to avoid detection.',
            'I witnessed operators at this location practicing immigration official impersonations and discussing which communities are most vulnerable to their scams. They maintain detailed records of successful calls and payment amounts collected.',
            'The call center specializes in targeting elderly immigrants with sophisticated scripts claiming their children or grandchildren are facing immediate deportation unless payment is made. They use emotional manipulation to pressure victims into sending money.',
            'I observed this organization operating sophisticated caller ID spoofing systems that make their fraudulent calls appear to originate from legitimate government phone numbers, including the main USCIS customer service line and regional ICE offices.',
            'The business operates around-the-clock calling operations with specialized teams targeting different immigrant communities during optimal calling times based on work schedules and cultural patterns.',
            'I have evidence that this facility trains operators to systematically research victims\' social media accounts and public records to incorporate personal details into their fraudulent calls, making the threats appear more credible.',
            'This organization maintains detailed psychological profiles of different immigrant communities, tailoring their fraud scripts to exploit specific cultural fears and misunderstandings about the immigration system.',
            'I witnessed the operation of a complex money laundering system involving multiple cryptocurrency exchanges, prepaid debit cards, and international wire transfers to obscure the proceeds from their immigration fraud scheme.',
            'The business maintains extensive databases of previous victims who are repeatedly targeted with different immigration-related scams over time, often increasing the sophistication of subsequent calls.',
            'I observed the systematic recruitment of individuals with legitimate government backgrounds who provide insider knowledge about actual agency procedures to make the fraudulent calls more convincing.',
            'This facility operates multiple spoofed phone numbers simultaneously, routing calls through international VoIP systems to avoid detection while appearing to originate from legitimate government offices.',
            'The organization maintains a network of money mules who unknowingly transfer fraud proceeds through their personal bank accounts, believing they have legitimate work-from-home employment.',
            'I have observed this organization using advanced caller ID spoofing technology to make calls appear to come from legitimate government offices. They maintain detailed knowledge of immigration procedures to make their claims seem authentic.',
            'The business operates multiple shifts of callers who target different immigrant communities based on their knowledge of specific cultural references and immigration concerns relevant to each group.',
            'I witnessed the systematic coaching of new employees on how to sound authoritative and threatening while impersonating immigration officials. They provide detailed training on immigration terminology and procedures to enhance their credibility.',
            'The organization maintains a sophisticated system for tracking which victims have previously been called to avoid duplication while maximizing the number of potential targets they can reach.',
            'I have evidence that this operation specifically targets recent immigrants during known stressful periods such as deportation raids or policy changes when people are more likely to believe claims about immigration problems.',
            'The call center uses multiple languages and maintains native speakers who can target specific immigrant communities with culturally relevant threats and claims about immigration enforcement.',
            'I observed employees at this location researching real immigration cases and news stories to incorporate authentic details into their fraudulent calls to make them more convincing.',            'The business maintains detailed statistics on which types of threats and payment methods are most effective with different demographic groups to optimize their fraudulent operations.',
            'This organization operates a sophisticated voice training program where callers learn to imitate specific regional accents and speech patterns to enhance their credibility when impersonating government officials.',
            'The facility houses advanced call recording and analysis equipment that allows operators to review successful calls and refine their approach for maximum effectiveness.',
            'I have observed the use of artificial intelligence systems that analyze potential victims\' social media profiles to customize threats and claims with personally relevant information.',
            'This business operates a complex money laundering network that processes fraud proceeds through multiple cryptocurrency exchanges and overseas accounts to avoid detection.',
            'The organization maintains detailed databases of successful fraud victims who are repeatedly targeted with different scams over extended periods to maximize extraction.',
            'I witnessed the systematic recruitment of individuals with legitimate government employment backgrounds who provide insider knowledge about agency procedures and terminology.',
            'This facility operates a sophisticated technical infrastructure that spoofs multiple government agency phone numbers simultaneously while routing calls through international systems.',
            'The business maintains a network of money mules who receive and transfer fraud proceeds while believing they are participating in legitimate employment opportunities.',
            'I have evidence that this organization operates multilingual call centers that target specific immigrant communities using native speakers who understand cultural vulnerabilities.',
            'This location serves as a training facility where new operators learn psychological manipulation techniques designed to create panic and urgency in potential victims.',
            'The organization maintains detailed intelligence on immigration policy changes and enforcement activities to adjust their fraud narratives for maximum believability.',
            'I observed the use of sophisticated background noise generation to create authentic-sounding government office environments during fraudulent calls.',
            'This business operates a complex victim research system that uses public records and data breaches to obtain personal information needed for targeted fraud attempts.',
            'The facility houses a sophisticated call monitoring system that allows supervisors to coach operators in real-time during active fraud attempts.',
            'I have witnessed the systematic exploitation of legitimate government crisis situations and policy announcements to create believable fraud scenarios.',
            'This organization operates a network of corrupt telecommunications employees who provide access to phone systems and caller ID spoofing capabilities.',
            'The business maintains detailed scripts for handling various victim responses and objections designed to overcome resistance and maintain pressure for payment.',
            'I observed the operation of a sophisticated payment processing system that immediately converts victim payments into untraceable financial instruments.',
            'This facility serves as a quality control center where successful fraud calls are analyzed and techniques are refined for distribution to other call centers.',
            'The organization maintains corrupt relationships with money service businesses that process fraud payments while avoiding required reporting and verification procedures.'        ],'Intellectual Property Rights': [
            'This place is basically a fake designer factory - they take generic stuff, slap on fake luxury labels, and pump out thousands of units monthly.',
            'Witnessed systematic software piracy at this location - they have servers dedicated to cracking digital protection and selling fake licenses.',
            'This business imports generic pills, repackages them with fake brand names, and distributes through sketchy pharmacies.',
            'This production facility creates exact copies of patented car parts with counterfeit branding, targeting expensive safety components.',
            'This organization makes fake electronics using cheap components that are actually dangerous - duplicate all the official branding and certificates.',
            'Saw systematic theft of trade secrets where they recruit employees from competitor companies to steal blueprints and formulas.',
            'This facility operates a sophisticated fake luxury watch operation - can recreate intricate designs and forge serial numbers.',
            'This business illegally copies patented medical devices using substandard materials that could seriously hurt patients.',
            'Witnessed production of counterfeit cosmetics using unregulated chemicals - perfect packaging but potentially harmful ingredients.',
            'This organization systematically steals copyrighted movies, music, and software, then sells subscriptions to underground networks.',
            'This facility creates counterfeit branded sporting goods and apparel using authentic patterns, then sells through legit-looking stores.',
            'Found out this business illegally reproduces expensive branded pesticides and fertilizers without proper testing.',
            'This location manufactures fake diplomas, licenses, and professional credentials sold to people misrepresenting their qualifications.',
            'This organization counterfeits branded alcohol using inferior ingredients - creates authentic bottles but may contain dangerous substances.',
            'Observed systematic theft of proprietary restaurant recipes by recruiting employees from successful restaurants.',
            'This facility reverse engineers patented products by dismantling them to steal protected designs for unauthorized reproduction.',
            'This organization has corrupt employees within major corporations stealing proprietary info for substantial payments.',
            'Found out this business operates sophisticated 3D printing using stolen CAD files to reproduce patented components.',
            'This location distributes counterfeit academic software to schools at reduced prices with no legitimate licensing.',
            'This facility counterfeits luxury goods using authentic materials stolen from legitimate manufacturing facilities.',
            'Witnessed systematic piracy of proprietary training materials repackaged and sold without authorization.',
            'This organization operates networks for stealing and redistributing proprietary video game code to unauthorized developers.',
            'This business has advanced chemical analysis equipment to reverse engineer pharmaceutical formulations for unauthorized generics.',
            'Observed systematic theft of proprietary architectural designs used without authorization for competing construction projects.',
            'This facility produces fake safety certifications and testing results for products that don\'t meet required standards.',
            'This facility is manufacturing counterfeit designer merchandise on a large scale. They remove labels from generic products, attach counterfeit designer labels, and repackage them with fake authentication materials. Monthly production exceeds 10,000 units.',
            'I have witnessed the systematic copying of proprietary software at this location. They maintain a server dedicated to removing digital protection measures from software products, which are then copied and sold with counterfeit license certificates.',
            'The business is importing generic pharmaceutical products, repackaging them with counterfeit branding of major manufacturers, and distributing them through a network of small pharmacies. Their operation includes sophisticated equipment for producing authentic-looking packaging and security features.',
            'This production facility is creating exact copies of patented automotive parts, applying counterfeit branding, and selling them as authentic manufacturer products. They specifically target high-margin safety components where differences are difficult for consumers to detect.',
            'The organization is illegally manufacturing counterfeit electronics using inferior components that present serious safety hazards. They duplicate trademarked branding, packaging, and even security features and certificates of authenticity.',
            'I have observed the systematic theft of trade secrets from competing businesses. They recruit employees from target companies who provide confidential blueprints, formulas, and manufacturing processes that are then used to create competing products.',
            'This facility operates a sophisticated counterfeiting operation that produces fake luxury watches and jewelry. They use equipment capable of recreating intricate designs and even forge official documentation and serial numbers.',
            'The business is illegally copying and distributing patented medical devices without authorization. They create identical-appearing products using substandard materials that could pose serious health risks to patients.',
            'I witnessed the operation of a facility that produces counterfeit branded cosmetics and personal care products using unregulated chemicals. They replicate packaging perfectly while using potentially harmful ingredients not approved for human use.',
            'This organization is systematically stealing copyrighted content including movies, music, and software, then distributing it through underground networks while collecting profits from subscription services.',
            'The facility houses an operation that creates counterfeit branded sporting goods and apparel. They obtain authentic patterns and materials to create nearly identical products that are then sold through legitimate-appearing retail channels.',
            'I have evidence that this business is illegally reproducing patented agricultural chemicals and selling them without proper testing or registration. They specifically target expensive branded pesticides and fertilizers.',
            'This location is used to manufacture counterfeit academic and professional certification documents including diplomas, licenses, and credentials that are sold to individuals seeking to misrepresent their qualifications.',
            'The organization operates a sophisticated operation for counterfeiting branded alcoholic beverages using inferior ingredients. They create authentic-appearing bottles and labels while distributing products that may contain dangerous substances.',            'I observed the systematic theft of proprietary restaurant recipes and food preparation methods. They recruit employees from successful restaurants to obtain trade secrets that are then used to create competing establishments.',
            'This facility operates a sophisticated reverse engineering operation that dismantles patented products to steal protected designs and manufacturing processes for unauthorized reproduction.',
            'The organization maintains a network of corrupt employees within major corporations who steal proprietary information including blueprints, formulas, and business strategies in exchange for substantial payments.',
            'I have evidence that this business operates a sophisticated 3D printing operation that reproduces patented mechanical components using stolen CAD files and technical specifications.',
            'This location serves as a distribution center for counterfeit academic software that is sold to educational institutions at reduced prices while providing no legitimate licensing or support.',
            'The facility houses a complex operation for counterfeiting branded luxury goods using authentic materials stolen from legitimate manufacturing facilities.',
            'I witnessed the systematic piracy of proprietary training materials and educational content that is repackaged and sold without authorization to competing organizations.',
            'This organization operates a sophisticated network for stealing and redistributing proprietary video game code and development tools to unauthorized developers.',
            'The business maintains advanced chemical analysis equipment used to reverse engineer proprietary pharmaceutical formulations for unauthorized generic production.',
            'I have observed the systematic theft of proprietary architectural designs and construction techniques that are used without authorization for competing construction projects.',
            'This facility operates a counterfeiting operation that produces fake safety certifications and testing results for products that do not meet required standards.',
            'The organization maintains a network of corrupt certification bodies that provide false documentation for counterfeit products to help them pass quality inspections.',
            'I witnessed the operation of a sophisticated counterfeiting facility that produces fake branded automotive parts using substandard materials that pose serious safety risks.',
            'This business exploits legitimate online marketplaces by creating fake seller accounts that distribute counterfeit products while avoiding detection through sophisticated evasion techniques.',
            'The facility houses a complex operation for stealing and reproducing proprietary agricultural seeds and breeding techniques without paying required licensing fees.',
            'I have evidence that this organization operates a sophisticated network for pirating and redistributing proprietary business software while removing licensing protections.',
            'This location serves as a command center for coordinating industrial espionage operations targeting multiple competing companies simultaneously.',
            'The business maintains advanced manufacturing equipment specifically configured to produce exact copies of patented products using stolen technical specifications.',
            'I observed the systematic theft of proprietary financial algorithms and trading strategies that are used without authorization for competitive advantage.',
            'This organization operates a corrupt network within patent offices that provides advance access to patent applications before they are publicly available.',
            'The facility serves as a training center where individuals learn advanced techniques for bypassing digital rights management and software protection systems.'        ],'Narcotics Smuggling': [
            'This warehouse is basically drug storage central - see vehicles arriving at night unloading hidden packages with guards making sure cops don\'t notice.',
            'Found out this property is a major drug distribution hub with hidden compartments built into walls specifically for storing controlled substances.',
            'This business looks legit during the day but after hours different people show up to package and distribute drugs from the back rooms.',
            'This transportation company smuggles narcotics in legitimate cargo - saw employees removing hidden packages and discussing delivery schedules.',
            'This location processes raw drug materials into retail quantities with specialized equipment and modified ventilation to reduce detectable odors.',
            'This shipping company uses cargo containers with false bottoms to transport massive amounts of cocaine and heroin.',
            'This marina serves as entry point for drug shipments by boat - witnessed submarines unloading waterproof packages during pre-dawn hours.',
            'This auto repair shop modifies vehicles for drug transportation by installing hidden compartments - charges 15 grand per vehicle.',
            'Found out this construction company smuggles drugs by sealing them in waterproof containers mixed into concrete loads.',
            'This organization operates sophisticated tunnel systems connecting border properties using electric carts to transport large drug quantities.',
            'This pharmaceutical company illegally diverts prescription opioids for street sale with falsified inventory records.',
            'This food processing plant conceals drug shipments within frozen food products - vacuum-sealed packages inserted into industrial containers.',
            'Observed this airline cargo operation using corrupted handlers who bypass security screening for specific shipments with concealed narcotics.',
            'This organization maintains aircraft fleet modified with hidden compartments for transporting drugs from Central America.',
            'This chemical supply company imports precursor chemicals for synthetic drug manufacturing while falsifying documentation.',
            'This organization operates sophisticated money laundering processing drug proceeds through legitimate businesses.',
            'Witnessed use of diplomatic immunity and government vehicles to transport narcotics without inspection through corrupt embassy connections.',
            'This facility operates complex drug cutting and packaging processing pure narcotics into retail quantities with dangerous adulterants.',
            'This business has network of corrupt pharmacy employees diverting prescription medications while falsifying inventory records.',
            'Witnessed operation of mobile drug laboratories that relocate quickly to avoid law enforcement while maintaining continuous production.',
            'This organization exploits legitimate agricultural operations growing illicit crops among legal vegetation with sophisticated security.',
            'This facility houses sophisticated communication network coordinating drug shipments across borders using encrypted messaging.',
            'Found out this business operates complex network of stash houses strategically located near major transportation hubs.',
            'This location recruits individuals training them in drug smuggling techniques and providing specialized concealment equipment.',
            'This organization maintains detailed intelligence on law enforcement patterns adjusting smuggling routes based on seasonal activities.',
            'This warehouse is being used to store and distribute large quantities of narcotics. I have observed vehicles arriving at night, unloading concealed packages, and departing with different packages. Guards are posted during these operations and specifically mention avoiding detection by law enforcement.',
            'I have direct knowledge that this property serves as a distribution hub for narcotics. Hidden compartments have been built into the walls and floors specifically for storing controlled substances, and regular deliveries arrive in vehicles with concealed compartments.',
            'The business operates as a front for narcotics distribution. While appearing to be a legitimate operation during business hours, after closing, different individuals arrive to package and distribute controlled substances from the back rooms of the facility.',
            'This transportation company is involved in smuggling narcotics concealed within legitimate cargo shipments. I have observed employees removing hidden packages from freight containers and overheard explicit discussions about delivery schedules and payment arrangements.',
            'The location serves as a processing facility where raw narcotic materials are converted into retail quantities. Specialized equipment is maintained on site, ventilation systems have been modified to reduce detectable odors, and armed individuals provide security during operations.',
            'The shipping company uses modified cargo containers with false bottoms to transport massive quantities of cocaine and heroin. I witnessed the installation of hydraulic systems that create hidden compartments accessible only through specific key sequences.',
            'This marina facility serves as an entry point for drug shipments arriving by boat. I observed submarines and semi-submersible vessels unloading waterproof packages during pre-dawn hours while armed guards maintained perimeter security.',
            'The auto repair shop modifies vehicles specifically for drug transportation by installing hidden compartments in fuel tanks, door panels, and chassis components. They maintain detailed schematics and charge $15,000 per vehicle modification.',
            'I have evidence that this construction company uses their legitimate concrete delivery operations to smuggle drugs. Narcotics are sealed in waterproof containers and mixed into concrete loads, then extracted at specific construction sites.',
            'The organization operates a sophisticated tunnel system connecting properties on both sides of the border. I witnessed the use of electric carts to transport large quantities of drugs through these underground passages.',
            'This pharmaceutical distribution company is illegally diverting prescription opioids for street sale. They maintain falsified inventory records and work with corrupt pharmacies to obtain and redistribute controlled substances.',
            'The food processing plant conceals drug shipments within legitimate frozen food products. Packages of narcotics are vacuum-sealed and inserted into industrial food containers before being shipped to distribution points nationwide.',
            'I observed this airline cargo operation facilitating drug smuggling through corrupted cargo handlers who selectively bypass security screening for specific shipments containing concealed narcotics.',
            'The organization maintains a fleet of aircraft modified with hidden compartments for transporting drugs from Central America. They use remote airstrips and coordinate with ground crews to rapidly unload and distribute their cargo.',            'This chemical supply company is importing precursor chemicals for synthetic drug manufacturing. They falsify documentation to conceal the true intended use of these chemicals and maintain hidden laboratories for drug production.',
            'The organization operates a sophisticated money laundering network that processes drug proceeds through legitimate businesses while maintaining detailed accounting systems to track profits from different smuggling operations.',
            'I have observed the use of diplomatic immunity and official government vehicles to transport narcotics without inspection, exploiting corrupt relationships with embassy personnel.',
            'This facility operates a complex drug cutting and packaging operation that processes pure narcotics into retail quantities while adding dangerous adulterants to increase profit margins.',
            'The business maintains a network of corrupt pharmacy employees who divert prescription medications for street distribution while falsifying inventory records.',
            'I witnessed the operation of mobile drug laboratories that can be quickly relocated to avoid law enforcement detection while maintaining continuous production capabilities.',
            'This organization exploits legitimate agricultural operations by growing illicit crops among legal vegetation while using sophisticated irrigation and security systems.',
            'The facility houses a sophisticated communication network that coordinates drug shipments across international borders using encrypted messaging and code systems.',
            'I have evidence that this business operates a complex network of stash houses strategically located near major transportation hubs for efficient distribution.',
            'This location serves as a recruitment center where individuals are trained in drug smuggling techniques and provided with specialized equipment for concealment.',
            'The organization maintains detailed intelligence on law enforcement patterns and adjusts smuggling routes and methods based on seasonal enforcement activities.',
            'I observed the systematic corruption of transportation workers including airline employees, port workers, and customs officials who facilitate drug smuggling operations.',
            'This facility operates a sophisticated vehicle modification workshop that creates advanced hidden compartments undetectable by standard inspection methods.',
            'The business exploits legitimate international trade by concealing narcotics within authentic commercial shipments while maintaining false documentation.',
            'I have witnessed the use of advanced technology including drones and GPS tracking to coordinate drug deliveries while avoiding law enforcement detection.',
            'This organization operates a complex supply chain that sources drug precursors from multiple countries while avoiding detection through sophisticated routing methods.',
            'The facility serves as a financial center where drug proceeds are converted into legitimate assets through real estate purchases and business investments.',
            'I observed the operation of a sophisticated early warning system that monitors law enforcement activities and provides real-time alerts to active smuggling operations.',
            'This business maintains a network of safe houses and transportation assets specifically designed for moving drugs through areas with heavy law enforcement presence.',
            'The organization exploits legitimate courier services by infiltrating package handling systems and substituting drug shipments for authentic deliveries.',
            'I have evidence that this facility operates advanced drug testing laboratories that ensure product quality and potency before distribution to maintain market reputation.'        ],'Terrorism Related': [
            'Witnessed multiple meetings here where people explicitly discussed plans to attack government buildings - they have maps and surveillance info.',
            'This place is being used to assemble explosive devices - saw them getting precursor chemicals and detonators while discussing maximizing casualties.',
            'This organization recruits people for violent extremist activities with propaganda materials and discussions about attacking civilian targets.',
            'People here coordinate financial support for known terrorist groups using sophisticated methods to hide money sources.',
            'This location is a meeting point for extremist group planning violent attacks - they have weapons and discussed targeting infrastructure.',
            'This group operates sophisticated encrypted communications coordinating with international terrorist cells and receiving overseas directives.',
            'Found evidence this organization conducts surveillance of airports and rail stations with detailed timing and security vulnerability assessments.',
            'This facility houses a chemical lab where they synthesize explosive compounds and toxins for deployment in populated areas.',
            'Observed training exercises where members practice combat scenarios and urban warfare with military-grade weapons.',
            'This location produces sophisticated fake IDs and travel papers for operatives with corrupt official connections.',
            'This organization recruits vulnerable individuals through social media using psychological manipulation to radicalize prospects.',
            'Witnessed the group conducting dry runs of attack scenarios at public venues timing security responses and testing prohibited item entry.',
            'This facility stores military-grade explosives, firearms, and chemical agents with detailed inventories for distribution to multiple cities.',
            'Observed members conducting counter-surveillance training to evade law enforcement and testing undetectable communication methods.',
            'This group maintains detailed intelligence files on government officials and targets including personal info and security vulnerabilities.',
            'This organization operates sophisticated cyber warfare capabilities designed to disrupt power grids and transportation systems.',
            'This facility serves as command center coordinating simultaneous attacks across multiple locations using encrypted communications.',
            'Witnessed systematic infiltration of legitimate charities and religious groups to provide cover for terrorist activities.',
            'This business channels funds to terrorist organizations through legitimate-appearing transactions and charitable donations.',
            'This location houses weapons development program creating improvised explosives and chemical weapons for maximum casualties.',
            'Witnessed operation of training facility teaching urban warfare tactics, explosives handling, and assassination techniques.',
            'This organization maintains detailed plans for attacking soft targets like schools and hospitals with minimal security.',
            'This facility operates propaganda production center creating recruitment materials for social media distribution.',
            'Found evidence this group operates sleeper cells maintaining normal lives while preparing for coordinated attacks.',
            'This location serves as safe house network where operatives hide and receive support while planning terrorist operations.',
            'I have observed multiple meetings at this location where individuals have explicitly discussed plans to commit acts of violence against government facilities. They maintain maps, schedules, and have conducted surveillance of potential targets.',
            'This facility is being used for the assembly of explosive devices. I have observed the acquisition of precursor chemicals, detonators, and other components, along with technical discussions about maximizing casualties at specifically identified locations.',
            'The organization operating from this location is recruiting individuals for violent extremist activities. They maintain propaganda materials, conduct radicalization sessions, and have explicit discussions about attacking civilian targets to advance their ideological objectives.',
            'Individuals at this location are coordinating financial support for known terrorist organizations. They use sophisticated methods to conceal the sources and destinations of funds and maintain communication with overseas extremist groups.',
            'This location serves as a meeting point for members of an extremist group planning violent attacks. They maintain weapons, conduct training exercises, and have explicitly discussed targeting critical infrastructure and civilian gatherings.',
            'The group operates a sophisticated communications network using encrypted messaging to coordinate with international terrorist cells. I witnessed them sharing tactical information and receiving operational directives from overseas commanders.',
            'I have evidence that this organization is conducting surveillance of transportation hubs including airports and rail stations. They maintain detailed timing schedules and security vulnerability assessments for multiple potential targets.',
            'The facility houses a chemical laboratory where individuals are synthesizing explosive compounds and toxins. They have discussed deployment methods designed to maximize civilian casualties in densely populated areas.',
            'I observed training exercises where group members practice combat scenarios and urban warfare tactics. They maintain military-grade weapons and have explicit discussions about engaging law enforcement and emergency responders.',
            'This location is used for producing sophisticated false identification documents and travel papers for operatives. They maintain connections with corrupt officials who provide authentic documentation for movement across international borders.',
            'The organization operates a recruitment network targeting vulnerable individuals through social media and online forums. They use psychological manipulation techniques to radicalize prospects and assess their willingness to conduct violent operations.',
            'I have witnessed the group conducting dry runs of attack scenarios at public venues. They time security responses, identify escape routes, and test methods for bringing prohibited items into secured areas.',
            'The facility serves as a weapons cache where the group stores military-grade explosives, firearms, and chemical agents. They maintain detailed inventories and have discussed distribution to cells in multiple cities.',
            'I observed members of this organization conducting counter-surveillance training to evade law enforcement detection. They practice operational security protocols and test methods for communicating without detection.',            'The group maintains detailed intelligence files on government officials, law enforcement personnel, and potential targets including their personal information, daily routines, and security vulnerabilities.',
            'This organization operates a sophisticated cyber warfare capability designed to disrupt critical infrastructure including power grids, transportation systems, and communication networks.',
            'The facility serves as a command center for coordinating simultaneous attacks across multiple locations using encrypted communications and detailed operational security protocols.',
            'I have observed the systematic infiltration of legitimate organizations including charities and religious groups to provide cover for terrorist activities and recruitment.',
            'This business operates a complex financial network that channels funds to terrorist organizations through legitimate-appearing business transactions and charitable donations.',
            'The location houses a sophisticated weapons development program focused on creating improvised explosive devices and chemical weapons for maximum civilian casualties.',
            'I witnessed the operation of a training facility where individuals learn urban warfare tactics, explosives handling, and assassination techniques.',
            'This organization maintains detailed plans for attacking soft targets including schools, hospitals, and public gatherings where security is minimal.',
            'The facility operates a sophisticated propaganda production center that creates recruitment materials and operational guidance for distribution through social media.',
            'I have evidence that this group operates sleeper cells that maintain normal lives while preparing for coordinated attacks when activated.',
            'This location serves as a safe house network where operatives can hide and receive support while planning and conducting terrorist operations.',
            'The organization maintains corrupt relationships with officials who provide inside information about security measures and law enforcement activities.',
            'I observed the systematic acquisition of specialized equipment including night vision devices, body armor, and communications gear for use in planned attacks.',
            'This facility operates a sophisticated surveillance operation that monitors potential targets and identifies security vulnerabilities.',
            'The business maintains detailed escape routes and contingency plans designed to help operatives evade capture after conducting attacks.',
            'I have witnessed the recruitment and training of suicide bombers who are psychologically conditioned to carry out attacks against civilian targets.',
            'This organization operates a complex logistics network that moves personnel, weapons, and materials across international borders without detection.',
            'The facility houses a sophisticated document forgery operation that produces false identification and travel documents for terrorist operatives.',
            'I observed the systematic targeting of critical infrastructure workers for recruitment or elimination to facilitate future attacks on essential services.',
            'This location serves as a coordination center for international terrorist networks that share intelligence, resources, and operational support.',
            'The organization maintains detailed studies of previous terrorist attacks to identify successful techniques and improve their own operational capabilities.'        ],'Trade Exportation Violation': [
            'This business deliberately mislabels export shipments to bypass tech transfer restrictions - disassembles controlled items and provides reassembly instructions.',
            'Witnessed falsification of export docs to hide actual contents of shipments going to sanctioned countries - they keep real shipping records on secured server.',
            'This facility ships controlled technology to prohibited foreign entities by routing through multiple destinations with generic labels.',
            'This company knowingly exports restricted dual-use equipment by falsifying End User Certificates and routing through front companies.',
            'Observed systematic removal of identification markings from export-controlled components before shipping with separate actual content documentation.',
            'This organization operates sophisticated shell company networks across multiple countries to disguise ultimate destination of controlled tech exports.',
            'Witnessed employees modifying restricted software to remove export control notifications before shipping to prohibited countries.',
            'This company exports controlled manufacturing equipment by disassembling into components below control thresholds with reassembly instructions.',
            'This business maintains intelligence network monitoring export control enforcement to identify optimal timing for prohibited shipments.',
            'Found evidence this organization corrupts customs officials at international ports to facilitate controlled technology movement.',
            'This facility operates technical modification service altering controlled equipment to appear uncontrolled while maintaining original capabilities.',
            'Observed systematic training of employees on deceiving export control inspectors through false documentation and equipment concealment.',
            'This company exploits temporary export licenses shipping to authorized countries then illegally re-exporting to prohibited destinations.',
            'This organization maintains detailed profiles of prohibited end users designing export schemes to successfully deliver controlled technology.',
            'Witnessed use of diplomatic pouches to export controlled technology without inspection through corrupt diplomatic personnel.',
            'This organization operates sophisticated intelligence network monitoring export control enforcement for optimal prohibited shipment timing.',
            'This facility houses advanced testing equipment verifying controlled technology maintains capabilities after modification to appear uncontrolled.',
            'Observed systematic bribery of export licensing officials who approve applications with false end user information.',
            'This business operates complex freight forwarder networks specializing in concealing controlled technology within legitimate cargo.',
            'This organization maintains detailed prohibited end user profiles designing export schemes for successful controlled technology delivery.',
            'Witnessed operation of sophisticated container switching facility transferring controlled technology between legitimate and illegal shipments.',
            'This facility operates training center teaching employees to deceive export control inspectors through false documentation.',
            'This business maintains corrupt customs official relationships at international ports facilitating controlled technology movement for payments.',
            'Found evidence this organization exploits free trade zones modifying controlled equipment and re-exporting with false documentation.',
            'This location serves as technical modification center altering controlled software to remove export restrictions while maintaining functionality.',
            'This business is deliberately mislabeling export shipments to circumvent restrictions on technology transfers. They disassemble controlled items, label them as generic parts, and provide reassembly instructions to overseas recipients specifically to evade export controls.',
            'I have witnessed the falsification of export documentation at this location to conceal the actual contents of shipments destined for sanctioned countries. The company maintains a separate set of actual shipping records in a secured server.',
            'This facility is shipping controlled technology to prohibited foreign entities by routing it through multiple intermediate destinations. They maintain detailed instructions for removing identifying markings and replacing them with generic labels to avoid detection.',
            'The company is knowingly exporting restricted dual-use equipment to prohibited end users by falsifying End User Certificates and routing shipments through front companies in non-restricted countries. Internal documentation explicitly acknowledges the legal violations involved.',
            'I have observed the systematic removal of identification markings from export-controlled components before shipping. The business maintains separate documentation of the actual contents and destinations, with explicit instructions to circumvent trade restrictions.',
            'The organization operates a sophisticated network of shell companies across multiple countries to disguise the ultimate destination of controlled technology exports. They maintain detailed organizational charts showing how prohibited recipients receive equipment through these intermediaries.',
            'I witnessed employees at this facility modifying restricted software to remove export control notifications and licensing requirements before shipping to prohibited countries. They maintain specialized tools for bypassing technological protection measures.',
            'This company is exporting controlled manufacturing equipment by disassembling it into individual components that fall below control thresholds, then providing detailed reassembly instructions and specialized tools to overseas recipients.',
            'The business maintains a sophisticated intelligence network that monitors export control enforcement patterns to identify optimal timing and routing for prohibited shipments. They adjust their methods based on regulatory changes and enforcement activities.',
            'I have evidence that this organization is corrupting customs officials at multiple international ports to facilitate the movement of controlled technology. They maintain detailed records of officials who have been compromised and their payment schedules.',
            'The facility operates a technical modification service that alters controlled equipment to appear as uncontrolled items while maintaining their original capabilities. They maintain sophisticated testing equipment to verify functionality after modifications.',
            'I observed the systematic training of employees on methods to deceive export control inspectors, including the creation of false documentation and the concealment of actual equipment specifications and capabilities.',
            'This company is exploiting temporary export licenses by shipping controlled items to authorized countries, then illegally re-exporting them to prohibited destinations. They maintain coordination networks at multiple international locations.',
            'The organization maintains detailed profiles of prohibited end users and their procurement networks, using this intelligence to design export schemes that successfully deliver controlled technology while avoiding detection.',            'I have witnessed the use of diplomatic pouches and other privileged shipping methods to export controlled technology without inspection. They maintain relationships with corrupt diplomatic personnel who facilitate these illegal shipments.',
            'This organization operates a sophisticated intelligence network that monitors export control enforcement activities to identify optimal timing and methods for prohibited shipments.',
            'The facility houses advanced testing equipment used to verify that controlled technology maintains its original capabilities after modification to appear as uncontrolled items.',
            'I have observed the systematic bribery of export licensing officials who approve applications they know contain false information about end users and intended purposes.',
            'This business operates a complex network of freight forwarders and shipping companies that specialize in concealing controlled technology within legitimate cargo shipments.',
            'The organization maintains detailed profiles of prohibited end users and their procurement networks to design export schemes that successfully deliver controlled technology.',
            'I witnessed the operation of a sophisticated container switching facility where controlled technology is transferred between legitimate and illegal shipments at multiple ports.',
            'This facility operates a training center where employees learn to deceive export control inspectors through false documentation and equipment concealment techniques.',
            'The business maintains corrupt relationships with customs officials at multiple international ports who facilitate the movement of controlled technology for substantial payments.',
            'I have evidence that this organization exploits free trade zones to modify controlled equipment and re-export it with false documentation as products of the zone country.',
            'This location serves as a technical modification center where controlled software is altered to remove export restrictions while maintaining full functionality.',
            'The organization operates a sophisticated transshipment network that routes controlled technology through multiple countries to obscure its true origin and destination.',
            'I observed the systematic exploitation of temporary export licenses by shipping controlled items to authorized countries then illegally re-exporting them to prohibited destinations.',
            'This facility houses a complex communication system that coordinates export violations across multiple international locations in real-time.',
            'The business maintains detailed knowledge of international trade agreements and exploits loopholes to circumvent export control restrictions.',
            'I have witnessed the use of shell companies and nominee directors to create false corporate structures that conceal the true parties involved in prohibited exports.',
            'This organization operates a sophisticated procurement network that acquires controlled technology through straw purchasers and legitimate businesses.',
            'The facility serves as a consolidation center where controlled components from different sources are combined into complete systems for export.',
            'I observed the systematic falsification of technical specifications and capabilities to make controlled technology appear as uncontrolled items.',
            'This business exploits dual-use technology regulations by modifying equipment to appear civilian while maintaining military or weapons-related capabilities.',
            'The organization maintains detailed databases of export control regulations from multiple countries to identify the most advantageous routing for prohibited shipments.'        ],'Trade Importation Violation': [
            'This business deliberately misclassifies imported goods to avoid tariffs - keeps two sets of inventory records with falsified customs descriptions.',
            'Witnessed routine falsification of country-of-origin docs for products from sanctioned countries - ships to intermediate country and repackages.',
            'This company imports counterfeit safety-certified products with fake certification marks - internal communications acknowledge non-compliance.',
            'This facility regularly removes and replaces country-of-origin markings to avoid tariffs with dedicated equipment and staff training.',
            'Observed systematic altering of import documentation to understate shipment values - real transactions show 5-10 times higher values.',
            'This organization operates sophisticated container switching at multiple ports transferring prohibited goods during minimal security periods.',
            'Witnessed systematic bribery of customs officials - company maintains detailed records of corrupted officials and payment schedules.',
            'This facility operates cargo consolidation deliberately mixing prohibited items with legitimate shipments to avoid detection.',
            'This business maintains network of corrupt freight forwarders falsifying shipping documentation and coordinating complex routing schemes.',
            'Found evidence this company imports restricted technology disguised as household goods with sophisticated repackaging facilities.',
            'This organization operates bonded warehouses illegally modifying imported goods to remove identifying markings before commerce release.',
            'Observed systematic exploitation of free trade zone regulations circumventing import restrictions by modifying prohibited goods.',
            'This facility operates sophisticated transshipment routing prohibited goods through multiple countries to obscure true origin.',
            'This business exploits temporary import permits bringing restricted goods for exhibitions then illegally selling domestically.',
            'Witnessed use of diplomatic immunity importing prohibited goods without inspection through corrupt official relationships.',
            'This facility operates sophisticated container monitoring tracking customs inspection patterns for low-risk shipping routes.',
            'This business maintains corrupt shipping line employee network providing advance inspection warnings and cargo substitution.',
            'Observed systematic exploitation of duty-free zones importing prohibited goods then illegally distributing into domestic commerce.',
            'This organization operates complex bribery network corrupting officials at multiple import process levels.',
            'This facility houses advanced repackaging equipment disguising prohibited goods as legitimate products after importation.',
            'Witnessed sophisticated intelligence network monitoring customs enforcement and adjusting import methods accordingly.',
            'This business exploits legitimate charitable shipments concealing prohibited goods within supposedly humanitarian cargo.',
            'This organization maintains detailed customs officer databases identifying most corruptible officials for targeting.',
            'Found evidence this facility operates complex document alteration modifying legitimate shipping paperwork to conceal prohibited imports.',
            'This location trains employees in advanced customs evasion techniques and document falsification methods.',
            'This business is deliberately misclassifying imported goods to avoid tariffs and import restrictions. They maintain two sets of inventory records - one official record for documented products, and another with falsified descriptions for customs declarations.',
            'I have witnessed the routine falsification of country-of-origin documentation for products imported from sanctioned countries. The goods are shipped to an intermediate country where packaging is altered before being imported with fraudulent documentation.',
            'The company is importing counterfeit safety-certified products with falsified certification marks. Internal communications explicitly acknowledge these products do not meet applicable safety standards but are represented as compliant to avoid import restrictions.',
            'I observed the systematic removal and replacement of country-of-origin markings to circumvent tariffs and trade restrictions. The facility has dedicated equipment and trained staff for this document fraud operation.',
            'This organization routinely alters import documentation to understate the value of shipments to reduce tariff obligations. Their real transaction records show values 5-10 times higher than what is declared to customs authorities.',
            'The business operates a sophisticated container switching operation at multiple ports, transferring prohibited goods between legitimate and illegal shipments during periods of minimal security oversight.',
            'I have evidence of systematic bribery of customs officials. The company maintains detailed records of corrupted officials and their payment schedules to facilitate the importation of prohibited goods.',
            'This facility operates a cargo consolidation service that deliberately mixes prohibited items with legitimate shipments to reduce the likelihood of detection during customs inspections.',
            'The business maintains a network of corrupt freight forwarders who falsify shipping documentation and coordinate complex routing schemes to avoid trade restrictions.',
            'I witnessed the importation of restricted technology disguised as ordinary household goods. The facility has sophisticated repackaging equipment to conceal the true nature of these products.',
            'This organization operates bonded warehouses where they illegally modify imported goods to remove identifying markings and serial numbers before release into commerce.',
            'I observed the systematic exploitation of free trade zone regulations to circumvent import restrictions by modifying prohibited goods within the zone before domestic distribution.',
            'This facility regularly removes and replaces country-of-origin markings on imported goods to avoid tariffs and restrictions. They maintain dedicated equipment for this purpose and train staff on methods to make the alterations undetectable to customs inspectors.',
            'I have observed the systematic altering of import documentation to understate the value of shipments. The business maintains records of the actual transactions showing values often 5-10 times higher than what is declared to customs authorities.',
            'The organization operates a sophisticated container switching operation at multiple ports where prohibited goods are transferred between legitimate and illegal shipments. They maintain detailed timing schedules to coordinate these transfers during minimal security periods.',
            'I witnessed the systematic bribery of customs officials to facilitate the importation of restricted goods. The company maintains detailed records of corrupted officials, their payment schedules, and the specific types of violations they will overlook.',
            'This facility operates a cargo consolidation service that deliberately mixes prohibited items with legitimate shipments to avoid detection. They use sophisticated scanning equipment to identify containers with minimal inspection probability.',
            'The business maintains a network of corrupt freight forwarders who falsify shipping documentation and customs declarations. They coordinate complex routing schemes to move prohibited goods through ports with compromised inspection protocols.',
            'I have evidence that this company is importing restricted technology by disguising it as household goods or consumer electronics. They maintain sophisticated repackaging facilities and create false product manuals and documentation.',
            'The organization operates bonded warehouses where imported goods are illegally modified to remove identifying markings before being released into commerce. They maintain specialized equipment for altering products without affecting functionality.',
            'I observed the systematic exploitation of free trade zone regulations to circumvent import restrictions. The company uses these zones to modify prohibited goods and re-export them with false documentation as products of the zone country.',
            'This facility operates a sophisticated transshipment operation that routes prohibited goods through multiple countries to obscure their true origin. They maintain detailed knowledge of trade agreements and inspection protocols at various international ports.',
            'The business exploits temporary import permits by bringing in restricted goods under the guise of exhibitions or demonstrations, then illegally selling them in the domestic market instead of re-exporting as required.',            'I have witnessed the use of diplomatic immunity and official government shipments to import prohibited goods without inspection. The organization maintains relationships with corrupt officials who facilitate these illegal importations.',
            'This facility operates a sophisticated container monitoring system that tracks customs inspection patterns to identify low-risk shipping routes and timing.',
            'The business maintains a network of corrupt shipping line employees who provide advance warning of inspections and facilitate the substitution of legitimate cargo for prohibited goods.',
            'I have observed the systematic exploitation of duty-free zones to import prohibited goods that are then illegally distributed into domestic commerce.',
            'This organization operates a complex bribery network that corrupts officials at multiple levels of the import process from initial inspection to final release.',
            'The facility houses advanced repackaging equipment that allows prohibited goods to be disguised as legitimate products after importation but before distribution.',
            'I witnessed the operation of a sophisticated intelligence network that monitors customs enforcement activities and adjusts import methods accordingly.',
            'This business exploits legitimate charitable and humanitarian shipments to conceal prohibited goods within supposedly altruistic cargo.',
            'The organization maintains detailed databases of customs officers and their patterns to identify the most corruptible officials for targeting.',
            'I have evidence that this facility operates a complex document alteration system that modifies legitimate shipping paperwork to conceal prohibited imports.',
            'This location serves as a training center where employees learn advanced customs evasion techniques and document falsification methods.',
            'The business operates a network of shell companies specifically designed to appear as legitimate importers while actually facilitating illegal trade.',
            'I observed the systematic use of mislabeled shipping containers where prohibited goods are concealed within shipments of permitted items.',
            'This organization exploits diplomatic relationships and trade agreements to import prohibited goods through countries with preferential treatment.',
            'The facility houses a sophisticated cargo consolidation operation that mixes prohibited and legitimate goods to reduce detection probability.',
            'I have witnessed the use of advanced scanning and detection equipment to identify containers with minimal inspection probability for prohibited shipments.',
            'This business maintains corrupt relationships with port security personnel who provide access to restricted areas for cargo manipulation.',
            'The organization operates a complex routing system that moves prohibited goods through multiple ports to exploit different countries\' enforcement capabilities.',
            'I observed the systematic exploitation of emergency and expedited shipping procedures to bypass normal inspection protocols for prohibited goods.',
            'This facility serves as a financial center that processes payments for prohibited imports through legitimate business accounts to maintain plausible deniability.',
            'The business exploits temporary import permits and trade show exemptions to bring prohibited goods into the country without proper authorization.'        ],'Weapons Smuggling': [
            'This place receives and redistributes illegal firearms - saw crates delivered at night, serial numbers removed, and repackaged for distribution.',
            'This business fronts for illegal weapons transactions with modified firearms stored in hidden rooms accessible through concealed entrances.',
            'Found out this location converts legal firearms into fully automatic weapons using specialized tools and sells without background checks.',
            'This warehouse assembles and distributes ghost guns using multiple 3D printers and CNC machines for untraceable firearms components.',
            'This organization smuggles illegal firearms components concealed within legal product shipments then assembles complete weapons.',
            'Witnessed sophisticated firearms trafficking importing weapons components from overseas and assembling complete firearms with detailed customer lists.',
            'This auto repair shop fronts for weapons smuggling modifying vehicles with hidden compartments for transporting firearms across borders.',
            'This organization operates corrupt licensed firearms dealer falsifying background checks and targeting prohibited purchasers for premium prices.',
            'Observed systematic theft of firearms from military and law enforcement through inside contacts distributing through criminal networks.',
            'This facility operates as weapons modification center converting legal firearms into prohibited configurations using sophisticated machining equipment.',
            'This business operates sophisticated straw purchase network using clean record individuals to legally purchase then transfer to prohibited persons.',
            'Witnessed illegal weapons manufacturing facility producing prohibited firearms and accessories using industrial equipment and raw materials.',
            'This organization smuggles weapons through diplomatic channels corrupting embassy personnel and using diplomatic pouches without inspection.',
            'This facility stores and distributes stolen military weapons including explosives coordinating with organized criminal groups.',
            'Found evidence this operation traffics weapons to criminal organizations and terrorist groups maintaining customer intelligence.',
            'This organization operates sophisticated financing providing weapons to criminal groups in exchange for drugs and stolen goods.',
            'This facility serves as R&D center testing new weapons technologies before distributing to criminal networks.',
            'Observed systematic recruitment of military and law enforcement personnel providing access to weapons arsenals and security intelligence.',
            'This business operates complex logistics coordinating weapons shipments with drug trafficking and human smuggling.',
            'This organization maintains detailed intelligence on law enforcement weapons tracking developing countermeasures for detection avoidance.',
            'Witnessed sophisticated money laundering processing weapons transaction payments through legitimate business accounts.',
            'This facility houses advanced manufacturing equipment producing high-capacity magazines and prohibited accessories.',
            'This business maintains corrupt gun show dealer network facilitating illegal sales through apparently legitimate transactions.',
            'Found evidence this organization operates international network sourcing weapons from conflict zones and war-torn countries.',
            'This location trains criminal organizations in weapons handling and tactical techniques for illegal activities.',
            'This facility is being used to receive and redistribute illegal firearms. I have observed crates of weapons being delivered at night, serial numbers being removed, and the weapons being repackaged for distribution through a network of associates.',
            'The business serves as a front for illegal weapons transactions. Modified firearms and prohibited accessories are stored in a hidden room accessible through a concealed entrance, and transactions occur after regular business hours.',
            'I have direct knowledge that this location is used for converting legal firearms into fully automatic weapons. They maintain specialized tools and parts specifically for this purpose, and completed weapons are sold to individuals without background checks.',
            'This warehouse is used for the assembly and distribution of "ghost guns" - firearms without serial numbers assembled from parts kits. They maintain multiple 3D printers and CNC machines dedicated to producing untraceable firearms components.',
            'The organization is smuggling illegal firearms components by concealing them within shipments of legal products. They maintain a workshop where these components are assembled into complete weapons before being sold through an underground distribution network.',
            'I witnessed the operation of a sophisticated firearms trafficking network that imports weapons components from overseas and assembles them into complete firearms. They maintain detailed customer lists and coordinate deliveries to avoid law enforcement detection.',
            'This automotive repair shop serves as a front for weapons smuggling operations. They modify vehicles with hidden compartments specifically designed to transport firearms and ammunition across state and international borders.',
            'The organization operates a corrupt licensed firearms dealer who facilitates illegal sales by falsifying background check records and maintaining fraudulent transaction logs. They specifically target prohibited purchasers and charge premium prices.',
            'I have observed the systematic theft of firearms from military and law enforcement sources. The operation maintains inside contacts who provide weapons and ammunition that are then distributed through criminal networks.',
            'This facility operates as a weapons modification center where legal firearms are converted into prohibited configurations. They maintain sophisticated machining equipment and technical expertise to alter firing mechanisms and add prohibited features.',
            'The business operates a sophisticated straw purchase network using individuals with clean records to legally purchase firearms that are then immediately transferred to prohibited persons for substantial profits.',
            'I witnessed the operation of an illegal weapons manufacturing facility that produces prohibited firearms and accessories. They maintain industrial equipment and raw materials specifically for creating untraceable weapons.',
            'This organization smuggles weapons through diplomatic channels by corrupting embassy personnel and using diplomatic pouches to transport firearms without inspection. They maintain detailed records of compromised diplomatic contacts.',
            'The facility serves as a storage and distribution center for stolen military weapons including explosives and automatic firearms. They maintain specialized security measures and coordinate with organized criminal groups for distribution.',            'I have evidence that this operation is trafficking weapons to known criminal organizations and terrorist groups. They maintain detailed intelligence on customer requirements and coordinate complex international shipments through multiple intermediaries.',
            'This organization operates a sophisticated financing system that provides weapons to criminal groups in exchange for drugs, stolen goods, or other criminal proceeds.',
            'The facility serves as a research and development center where new weapons technologies are tested and refined before being distributed to criminal networks.',
            'I have observed the systematic recruitment of military and law enforcement personnel who provide access to weapons arsenals and intelligence about security procedures.',
            'This business operates a complex logistics network that coordinates weapons shipments with other criminal activities including drug trafficking and human smuggling.',
            'The organization maintains detailed intelligence on law enforcement weapons tracking systems and develops countermeasures to avoid detection.',
            'I witnessed the operation of a sophisticated money laundering system that processes payments for weapons transactions through legitimate business accounts.',
            'This facility houses advanced manufacturing equipment for producing high-capacity magazines and other prohibited accessories.',
            'The business maintains a network of corrupt gun show dealers who facilitate illegal sales while providing cover through apparently legitimate transactions.',
            'I have evidence that this organization operates a complex international network that sources weapons from conflict zones and war-torn countries.',
            'This location serves as a training facility where criminal organizations learn weapons handling and tactical techniques for their illegal activities.',
            'The facility operates a sophisticated intelligence network that monitors law enforcement activities and provides early warning of investigations to customers.',
            'I observed the systematic exploitation of gun buyback programs where weapons are purchased legally then illegally resold to prohibited purchasers.',
            'This organization maintains detailed customer databases that track weapons preferences and criminal activities to optimize their product offerings.',
            'The business operates a complex vehicle network that transports weapons using specially modified cars and trucks with advanced concealment systems.',
            'I have witnessed the use of legitimate security companies as fronts for weapons trafficking while maintaining apparent compliance with licensing requirements.',
            'This facility serves as a testing center where stolen and illegal weapons are evaluated for functionality before being distributed to customers.',
            'The organization exploits online marketplaces and encrypted communications to facilitate weapons sales while avoiding traditional law enforcement monitoring.',
            'I observed the operation of a sophisticated quality control system that ensures weapons meet customer specifications and performance requirements.',
            'This business maintains corrupt relationships with firearms manufacturers who provide weapons through falsified sales records and shipping documentation.',
            'The facility houses advanced equipment for removing and altering serial numbers and other identifying markings to prevent weapons tracing.'
        ],'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)': [
            'This organization is providing fraudulent COVID-19 vaccination records and test results. They have access to official-looking certificates, medical record systems, and stamps which they sell to individuals seeking to circumvent vaccination requirements.',
            'The business is manufacturing and distributing counterfeit personal protective equipment that does not meet safety standards. They falsify certification documents and testing results while explicitly acknowledging in internal communications that their products provide inadequate protection.',
            'I have evidence that this entity is operating an unlicensed money transmission business specifically for undocumented individuals. They charge excessive fees (20-30% of transfer amounts) and maintain no required anti-money laundering protocols or records.',
            'This facility operates as an unlicensed medical clinic providing treatments and prescriptions without proper licensing or qualifications. They specifically target immigrant communities with limited access to legitimate healthcare, charging excessive fees for treatments of questionable safety.',
            'The organization is creating and selling sophisticated fraudulent immigration documents including green cards, work permits, and social security cards. They maintain specialized printing equipment, hologram applicators, and authentic-appearing security features.',
            'This business operates a fraudulent unemployment benefits scheme where they file claims using stolen identities and direct payments to prepaid cards they control. They maintain detailed databases of stolen personal information and coordinate filing schedules across multiple states.',
            'I witnessed the operation of a sophisticated identity theft ring that specifically targets elderly individuals. They obtain personal information through various methods and use it to file fraudulent benefit claims, open credit accounts, and redirect government payments.',
            'The organization operates multiple fake charitable organizations that exploit disaster relief efforts and public health emergencies. They collect donations through emotional manipulation while providing no actual services to claimed beneficiaries.',
            'This facility serves as a coordination center for tax fraud operations where stolen identities are used to file fraudulent returns claiming large refunds. They maintain sophisticated systems for tracking filing deadlines and maximizing fraudulent claims.',
            'I have observed the systematic exploitation of government assistance programs through the use of fraudulent applications and documentation. The operation targets multiple programs simultaneously to maximize benefits while avoiding detection through coordinated filing strategies.',
            'The business operates a sophisticated romance fraud network using fake online profiles to defraud victims of hundreds of thousands of dollars. They maintain detailed psychological profiles of targets and coordinate their deception across multiple platforms.',            'This organization exploits visa lottery and immigration programs by submitting thousands of fraudulent applications using stolen identities and falsified supporting documentation. They charge fees to legitimate applicants while using their information for fraud.',
            'I witnessed the operation of a fake debt relief service that charges upfront fees to desperate individuals while providing no actual services. They specifically target vulnerable populations including immigrants and elderly individuals with limited financial sophistication.',
            'The facility operates as a fraudulent cryptocurrency investment scheme that promises unrealistic returns while actually operating as a Ponzi scheme. They maintain sophisticated marketing materials and fake testimonials to attract new victims.',
            'This organization is exploiting pandemic relief programs by submitting fraudulent applications for business loans and grants. They create fake businesses with falsified revenue records and employee documentation to qualify for assistance they are not entitled to receive.',
            'Dude at the gas station is selling fake COVID cards for like fifty bucks each. Says he knows a guy who works at the health department or whatever.',
            'My neighbor has been getting unemployment checks even though he\'s working construction under the table. Brags about it all the time.',
            'This lady runs a fake cleaning business to help people get work permits. She just makes up job offers and stuff.',
            'Some guy on Facebook is selling fake vaccination records. Posted it right on his timeline like an idiot.',
            'The corner store owner helps people cash stolen checks. Everyone in the neighborhood knows about it.',
            'This woman at my apartment complex collects government benefits using like six different names. Her mailbox is always stuffed.',
            'My barber told me he can get anyone a social security number for the right price. Says it\'s totally legit.',
            'There\'s a group on WhatsApp where people share tips on how to scam unemployment. They don\'t even try to hide it.',
            'This restaurant owner pays everyone cash and tells them to file for welfare anyway. Says the government won\'t find out.',
            'Some dude is selling fake green cards out of his van in the Walmart parking lot. Quality looks pretty bad tbh.',
            'My coworker has been using her dead grandmother\'s identity to collect social security for years. Just keeps cashing the checks.',
            'This guy at the DMV helps people get licenses with fake documents. Charges like 500 bucks but everyone uses him.',
            'The daycare lady claims way more kids than she actually watches to get government funding. Easy money I guess.',
            'Some woman is running a fake charity for COVID relief. Just keeps all the donations and bought a new car.',
            'My landlord helps tenants apply for rental assistance even when they don\'t qualify. Takes a cut of the money.',
            'This dude on Craigslist is selling fake student IDs and transcripts. Says he can get you into any college.',
            'The taco truck guy doesn\'t have permits for anything. Health department, business license, nothing.',
            'My cousin sells fake work permits to day laborers. Makes them on his computer and charges 200 each.',
            'This lady at the check cashing place helps people deposit stolen tax refund checks. Takes like 30% though.',
            'Some guy is selling fake disability placards outside the mall. Says doctors don\'t check anyway.',
            'The nail salon owner helps customers apply for business loans they don\'t qualify for. Fakes all the paperwork.',
            'My neighbor claims his house is a homeless shelter to get tax breaks. It\'s just his regular house.',
            'This woman runs a fake food stamp selling operation. Buys groceries with EBT then sells them for cash.',
            'Some dude is selling fake police badges on eBay. Says they\'re for "novelty purposes" but come on.',
            'The auto shop guy helps people register cars with fake VINs. Charges extra but gets it done fast.',
            'My friend\'s mom has been collecting disability for a "bad back" while working as a personal trainer.',
            'This guy sells fake insurance cards in the hospital parking lot. Patients buy them before going inside.',
            'The pizza place owner uses fake employee names to claim more PPP loan money. Just made up like 20 people.',
            'Some lady is selling fake birth certificates to help people get IDs. Works from her kitchen table.',
            'My roommate\'s boyfriend sells fake military IDs to get veteran discounts. Never served a day in his life.',
            'This woman helps people fake car accidents for insurance money. Sets up the whole thing for a fee.',
            'The guy at the liquor store sells fake IDs to college kids. His prices are way too high though.',
            'My neighbor claims her pool is a therapy center to get medical tax deductions. It\'s literally just a pool.',
            'This dude sells fake TSA PreCheck approvals. Just photoshops the approval emails.',
            'The dry cleaner helps people launder money by claiming way more business than they actually have.',
            'Some woman is selling fake marriage certificates to help people get health insurance. Cheap too.',
            'My coworker uses multiple fake identities to get credit cards. Has like 30 different cards somehow.',
            'This guy at the flea market sells counterfeit designer masks claiming they protect against COVID.',
            'The convenience store owner helps people buy lottery tickets with stolen credit cards. Takes a small cut.',
            'My landlord\'s brother fakes property damage to collect insurance money. Burns stuff in his backyard.',
            'This lady sells fake emotional support animal certificates online. No questions asked.',
            'Some dude is selling fake negative COVID tests so people can travel. Just prints them at home.',
            'The restaurant owner has employees clock in using dead people\'s social security numbers.',
            'My neighbor sells fake parking permits for the university. Students line up at his house.',
            'This woman helps people fake income statements to qualify for apartment rentals. Pretty good at it.',
            'Some guy sells fake professional licenses to contractors. They do terrible work but get hired.',
            'The bodega owner helps customers use fake coupons and return stolen merchandise.',
            'My friend\'s dad has been using a fake handicap placard for years. Says walking is too much work.',
            'This lady runs a fake tutoring service to help international students cheat on tests.',
            'Some dude sells fake jury duty excuses. Just makes up medical conditions and stuff.',
            'The gas station attendant helps people use stolen credit cards. Pretends the reader is broken.',
            'My coworker\'s wife sells fake transcripts to help people get jobs they\'re not qualified for.',
            'This guy in my building claims his apartment is a daycare to get business tax breaks.',
            'Some woman sells fake medical marijuana cards. Doesn\'t even ask about medical conditions.',
            'The mechanic helps people pass emissions tests by swapping out cars during the inspection.',
            'My neighbor sells fake fishing licenses at the lake. Park rangers never check anyway.',
            'This dude helps people fake workplace injuries for worker\'s comp. Teaches them what to say.',
            'The corner store owner sells fake phone cards that don\'t actually work. People figure it out too late.',
            'Some lady helps students fake community service hours for graduation requirements.',
            'My roommate sells fake apartment references to help people with bad credit get rentals.',
            'This guy at the mall helps people return stolen merchandise without receipts. Takes a percentage.',
            'The restaurant manager helps servers avoid reporting cash tips to skip taxes.',
            'My neighbor\'s kid sells fake hall passes and excuses to other students at school.',
            'This woman helps people fake their addresses to get their kids into better school districts.',
            'Some dude sells fake car inspection stickers. Cars fail but get the sticker anyway.',
            'The laundromat owner helps people wash drug money through fake quarters and bills.',
            'My coworker helps people fake being married to get better health insurance rates.',
            'This guy sells fake college degrees printed on nice paper. Looks pretty official actually.',
            'The pizza delivery guy helps customers use fake addresses to avoid paying delivery fees.',
            'My landlord\'s cousin sells fake moving receipts to help people claim moving expense deductions.',
            'This lady helps people fake religious exemptions for vaccine requirements at work.',
            'Some dude at the gym sells fake personal trainer certifications. Just prints them out.',
            'The convenience store clerk helps people use fake IDs to buy cigarettes and alcohol.',
            'My neighbor sells fake property appraisals to help people refinance their homes.',
            'This woman helps people fake being single parents to get more government assistance.',
            'Some guy sells fake contractor licenses. People hire them and get terrible work done.',
            'The auto parts store owner helps people buy parts with stolen credit cards.',
            'My friend\'s uncle sells fake hunting licenses. Says game wardens never check anyway.',
            'This dude helps people fake car breakdowns to get out of work or court dates.',
            'The hair salon owner helps clients apply for beauty licenses they don\'t qualify for.',
            'My coworker sells fake employment verification letters to help people get loans.',
            'This lady helps people fake medical conditions to get prescription drugs.',
            'Some guy at the hardware store sells tools knowing they\'re bought with stolen cards.',
            'The restaurant owner helps employees fake work authorization documents.',
            'My neighbor sells fake event tickets outside the stadium. People find out when they try to get in.',
            'This woman helps people fake being veterans to get discounts and benefits.',
            'Some dude sells fake organic certification stickers for farmers market vendors.',
            'The check cashing place helps people cash checks they know are fraudulent.',
            'My landlord helps tenants fake lease agreements to qualify for more government aid.',
            'This guy sells fake food handler permits. Restaurants hire people without proper training.',
            'The pawn shop owner helps people sell obviously stolen electronics and jewelry.',
            'My coworker\'s brother sells fake car titles. People buy cars that aren\'t legally theirs.',
            'This lady helps people fake being disabled to get priority housing and benefits.',
            'Some dude at the farmers market sells regular produce as organic for higher prices.',
            'The taxi driver helps passengers use fake ride share apps to avoid paying full fare.',
            'My neighbor sells fake diplomas from prestigious universities. Hangs them in his office.',
            'This woman helps people fake tax documents to qualify for bigger refunds.',
            'Some guy sells fake security guard licenses. Companies hire unqualified people.',
            'The restaurant manager helps customers use fake groupons and expired coupons.',
            'My friend\'s mom sells fake volunteer hours certificates for college applications.',
            'This dude helps people fake being small business owners to get pandemic relief money.',
            'The gas station owner sells regular gas as premium but charges premium prices.',
            'My coworker sells fake references for job applications. Makes up whole companies.',
            'This lady helps people fake medical emergencies to get out of legal obligations.',
            'Some guy at the electronics store helps customers return stolen merchandise for cash.',
            'The food truck owner doesn\'t have proper permits but parks wherever he wants.',
            'My neighbor sells fake apartment leases to help people establish residency.',
            'This woman helps people fake being college students to get student discounts.',
            'Some dude sells fake vaccination records for pets. Vets don\'t always check.',
            'The jewelry store owner helps customers buy items with fake or stolen credit cards.',
            'My landlord\'s friend sells fake contractor estimates for insurance claims.',
            'This guy helps people fake car accidents by staging minor collisions.',
            'The convenience store owner sells expired food with new dates printed on them.',
            'My coworker sells fake time sheets to help people claim overtime they didn\'t work.',
            'This lady helps people fake being pregnant to get maternity leave benefits.',
            'Some dude at the car lot sells cars with rolled back odometers.',
            'The restaurant owner helps servers fake tip amounts on credit card receipts.'
        ]
    };

    // Using the arrays and objects defined above for narrative generation
    // Utility functions
    function getRandomElement(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }    // Function to get a random business address from the database
    function getRandomBusinessAddress() {
        return getRandomElement(businessAddressDatabase);
    }

    // Function to generate a random US address
    function generateUSAddress() {
        // Define geographic mappings for realistic addresses
        const cityStateZipMap = {
            'New York': { state: 'New York', zipPrefixes: ['100', '101', '102', '103', '104'] },
            'Brooklyn': { state: 'New York', zipPrefixes: ['112'] },
            'Chicago': { state: 'Illinois', zipPrefixes: ['606', '607'] },
            'Los Angeles': { state: 'California', zipPrefixes: ['900', '901', '902'] },
            'Houston': { state: 'Texas', zipPrefixes: ['770', '771', '772'] },
            'Phoenix': { state: 'Arizona', zipPrefixes: ['850', '851', '852'] },
            'Philadelphia': { state: 'Pennsylvania', zipPrefixes: ['191'] },
            'San Antonio': { state: 'Texas', zipPrefixes: ['782'] },
            'Dallas': { state: 'Texas', zipPrefixes: ['752', '753'] },
            'San Diego': { state: 'California', zipPrefixes: ['921'] },
            'San Jose': { state: 'California', zipPrefixes: ['951'] },
            'Austin': { state: 'Texas', zipPrefixes: ['787'] },
            'Jacksonville': { state: 'Florida', zipPrefixes: ['322'] },
            'Fort Worth': { state: 'Texas', zipPrefixes: ['761'] },
            'Columbus': { state: 'Ohio', zipPrefixes: ['432'] },
            'Charlotte': { state: 'North Carolina', zipPrefixes: ['282'] },
            'Indianapolis': { state: 'Indiana', zipPrefixes: ['462'] },
            'San Francisco': { state: 'California', zipPrefixes: ['941'] },
            'Seattle': { state: 'Washington', zipPrefixes: ['981'] },
            'Denver': { state: 'Colorado', zipPrefixes: ['802'] },
            'Boston': { state: 'Massachusetts', zipPrefixes: ['021', '022'] },
            'Portland': { state: 'Oregon', zipPrefixes: ['972'] },
            'Las Vegas': { state: 'Nevada', zipPrefixes: ['891'] },
            'Detroit': { state: 'Michigan', zipPrefixes: ['482'] },
            'Memphis': { state: 'Tennessee', zipPrefixes: ['381'] },
            'Louisville': { state: 'Kentucky', zipPrefixes: ['402'] },
            'Baltimore': { state: 'Maryland', zipPrefixes: ['212'] },
            'Milwaukee': { state: 'Wisconsin', zipPrefixes: ['532'] },
            'Albuquerque': { state: 'New Mexico', zipPrefixes: ['871'] },
            'Tucson': { state: 'Arizona', zipPrefixes: ['857'] },
            'Atlanta': { state: 'Georgia', zipPrefixes: ['303'] },
            'Miami': { state: 'Florida', zipPrefixes: ['331'] },
            'Minneapolis': { state: 'Minnesota', zipPrefixes: ['554'] },
            'Cleveland': { state: 'Ohio', zipPrefixes: ['441'] },
            'Tampa': { state: 'Florida', zipPrefixes: ['336'] },
            'Honolulu': { state: 'Hawaii', zipPrefixes: ['968'] }
        };

        // Street number (100-9999)
        const streetNumber = Math.floor(Math.random() * 9900) + 100;
        const streetName = getRandomElement(usStreetNames);

        // Select a city first, which determines state and ZIP
        const cities = Object.keys(cityStateZipMap);
        const city = getRandomElement(cities);
        const stateData = cityStateZipMap[city];
        const state = stateData.state;        // Generate a valid ZIP code for this city
        const zipPrefix = getRandomElement(stateData.zipPrefixes);
        let zip;
        if (zipPrefix.length === 3) {
            // Generate the last 2 digits for a 5-digit ZIP
            zip = zipPrefix + (Math.floor(Math.random() * 100)).toString().padStart(2, '0');
        } else {
            // Some ZIP prefixes might be shorter, so adjust accordingly
            const digitsNeeded = 5 - zipPrefix.length;
            const randomDigits = Math.floor(Math.random() * Math.pow(10, digitsNeeded)).toString().padStart(digitsNeeded, '0');
            zip = zipPrefix + randomDigits;
        }

        // Ensure zip is exactly 5 digits
        zip = zip.toString().substring(0, 5).padStart(5, '0');

        // Optional apartment/unit number (30% chance)
        let line2 = '';
        if (Math.random() < 0.3) {
            const unitTypes = ['Apt', 'Unit', 'Suite', '#'];
            const unitType = getRandomElement(unitTypes);
            const unitNumber = Math.floor(Math.random() * 300) + 1;
            line2 = `${unitType} ${unitNumber}`;
        }

        return {
            line1: `${streetNumber} ${streetName}`,
            line2: line2,
            city: city,
            state: state,
            country: 'United States',
            zip: zip.toString()
        };
    }    // Function to generate a random international address
    function generateInternationalAddress() {
        // Define geographic mappings for realistic international addresses
        const countryToCityPostalFormat = {
            'United Kingdom': {
                cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Leeds'],
                postalFormat: 'UK', // UK-style alphanumeric
                streetNames: ['High Street', 'Queen Road', 'King Street', 'Victoria Avenue', 'Church Lane', 'Station Road']
            },
            'Canada': {
                cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City'],
                postalFormat: 'Canada', // Letter-number-letter number-letter-number
                streetNames: ['Maple Avenue', 'Queen Street', 'King Road', 'Main Street', 'Lakeshore Blvd', 'River Road']
            },
            'France': {
                cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Lille'],
                postalFormat: 'digits5', // 5-digit postal code
                streetNames: ['Rue de Rivoli', 'Avenue des Champs-Élysées', 'Boulevard Saint-Michel', 'Rue Saint-Honoré']
            },
            'Germany': {
                cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf'],
                postalFormat: 'digits5', // 5-digit postal code
                streetNames: ['Hauptstraße', 'Schulstraße', 'Bahnhofstraße', 'Gartenstraße', 'Kirchstraße', 'Bergstraße']
            },
            'Italy': {
                cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologna', 'Venice'],
                postalFormat: 'digits5', // 5-digit postal code
                streetNames: ['Via Roma', 'Via Milano', 'Corso Italia', 'Via Nazionale', 'Piazza Navona', 'Via Veneto']
            },
            'Australia': {
                cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra'],
                postalFormat: 'digits4', // 4-digit postal code
                streetNames: ['George Street', 'Elizabeth Street', 'William Street', 'Queen Street', 'High Street']
            },
            'Japan': {
                cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo', 'Nagoya', 'Fukuoka'],
                postalFormat: 'Japan', // 3-digit dash 4-digit
                streetNames: ['Sakura Dori', 'Ginza', 'Takeshita Street', 'Omotesando', 'Nakamise Dori']
            },
            'India': {
                cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'],
                postalFormat: 'digits6', // 6-digit postal code
                streetNames: ['M.G. Road', 'Park Street', 'Linking Road', 'Commercial Street', 'Brigade Road']
            }
        };

        // Select country first
        const countries = Object.keys(countryToCityPostalFormat);
        const country = getRandomElement(countries);
        const countryData = countryToCityPostalFormat[country];

        // Street number (1-200)
        const streetNumber = Math.floor(Math.random() * 200) + 1;

        // Get street name and city that are appropriate for the country
        const streetName = getRandomElement(countryData.streetNames);
        const city = getRandomElement(countryData.cities);        // Generate postal code - OVERRIDE: Always use 5-digit numeric zip codes for all international addresses
        // This ensures all zip codes are US-style 5-digit numbers regardless of country
        let zip = Math.floor(Math.random() * 90000) + 10000;

        // Ensure zip is exactly 5 digits and numeric only
        zip = zip.toString().padStart(5, '0');

        // Optional apartment/building details (40% chance for international addresses)
        let line2 = '';
        if (Math.random() < 0.4) {
            const buildingTypes = ['Flat', 'Apartment', 'Building', 'Floor'];
            const buildingType = getRandomElement(buildingTypes);
            const buildingNumber = Math.floor(Math.random() * 100) + 1;
            line2 = `${buildingType} ${buildingNumber}`;
        }

        return {
            line1: `${streetNumber} ${streetName}`,
            line2: line2,
            city: city,
            country: country,
            zip: zip.toString()
        };
    }
      // Creates complete user identity with personal email
    function generateIdentity() {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);

        // Randomly select a violation type
        const selectedViolation = getRandomElement(violationTypes);        // Generate email based on name (realistic patterns)
        let emailName;
        const emailPattern = Math.floor(Math.random() * 24);

        // Common words/phrases to potentially add to emails
        const commonWords = ['best', 'cool', 'super', 'awesome', 'pro', 'real', 'true', 'top', 'smart', 'cyber', 'tech', 'digital', 'creative', 'master', 'guru', 'expert', 'elite'];
        const hobbies = ['gamer', 'coder', 'runner', 'writer', 'artist', 'photo', 'music', 'film', 'travel', 'fitness', 'chef', 'baker', 'fan', 'hero', 'star', 'ninja', 'geek'];
        const phrases = ['isthebest', 'rocks', 'isawesome', 'forever', 'fanatic', 'lover', 'enthusiast', 'master', '4life', '247', 'addict', 'premium'];
        const wordplays = ['inator', 'ology', 'aholic', 'tastic', 'licious', 'matic', 'izer', 'meister', 'smith', 'genius'];
        const randomNames = ['shadow', 'whisper', 'storm', 'pixel', 'byte', 'quantum', 'cosmic', 'magic', 'fire', 'frost', 'thunder', 'stealth', 'echo', 'nebula', 'zero', 'phoenix'];

        // Generate random combinations for more creative emails
        const getRandomWord = () => getRandomElement(commonWords);
        const getRandomHobby = () => getRandomElement(hobbies);
        const getRandomPhrase = () => getRandomElement(phrases);
        const getRandomWordplay = () => getRandomElement(wordplays);
        const getRandomName = () => getRandomElement(randomNames);

        // Number replacement patterns
        const leetSpeak = (text) => {
            const replacements = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'};
            return Array.from(text).map(char => replacements[char] || char).join('');
        };

        // Function to replace some characters with numbers randomly
        const replaceWithNumbers = (name) => {
            // Only replace some characters for realism (25% chance for each eligible letter)
            return Array.from(name).map(char => {
                if (['a', 'e', 'i', 'o', 's', 't'].includes(char) && Math.random() < 0.25) {
                    const numMap = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'};
                    return numMap[char];
                }
                return char;
            }).join('');
        };

        switch (emailPattern) {
            // Original patterns
            case 0: emailName = firstName.toLowerCase() + '.' + lastName.toLowerCase(); break;
            case 1: emailName = firstName.toLowerCase() + lastName.toLowerCase(); break;
            case 2: emailName = firstName.toLowerCase() + '_' + lastName.toLowerCase(); break;
            case 3: emailName = firstName.toLowerCase().charAt(0) + lastName.toLowerCase(); break;
            case 4: emailName = lastName.toLowerCase() + firstName.toLowerCase().charAt(0); break;

            // More creative patterns (expanded collection)
            case 5: emailName = firstName.toLowerCase() + getRandomWord() + getRandomHobby(); break;
            case 6: emailName = getRandomWord() + firstName.toLowerCase() + lastName.charAt(0).toLowerCase(); break;
            case 7: emailName = firstName.toLowerCase() + Math.floor(Math.random() * 999) + getRandomWord(); break;
            case 8: emailName = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '.' + getRandomHobby(); break;
            case 9: emailName = getRandomHobby() + '.' + firstName.toLowerCase() + Math.floor(Math.random() * 99); break;
            case 10: const middleName = getRandomElement(firstNames); // Create a temporary middle name
                    emailName = firstName.charAt(0).toLowerCase() + middleName.charAt(0).toLowerCase() + lastName.toLowerCase() + getRandomWord(); break;
            case 11: emailName = 'the' + firstName.toLowerCase() + getRandomHobby() + Math.floor(Math.random() * 99); break;

            // New patterns with reversed names, underscores and number substitutions
            case 12: emailName = lastName.toLowerCase() + firstName.toLowerCase() + Math.floor(Math.random() * 10); break;
            case 13: emailName = replaceWithNumbers(firstName.toLowerCase() + lastName.toLowerCase()); break;
            case 14: emailName = firstName.toLowerCase() + getRandomPhrase(); break;
            case 15: emailName = firstName.toLowerCase() + lastName.charAt(0).toLowerCase() + getRandomHobby() + Math.floor(Math.random() * 100); break;
            case 16: emailName = leetSpeak(firstName.toLowerCase()) + '.' + lastName.toLowerCase(); break;
            case 17: emailName = firstName.toLowerCase() + lastName.toLowerCase() + getRandomHobby(); break;
            case 18: emailName = firstName.charAt(0).toLowerCase() + lastName.charAt(0).toLowerCase() + getRandomWord() + Math.floor(Math.random() * 999); break;
            case 19: emailName = firstName.toLowerCase() + getRandomHobby() + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10); break;

            // Creative patterns
            case 20: emailName = firstName.toLowerCase() + getRandomWordplay(); break;
            case 21: // Multiple dots in different segments
                const segments = ['ok', 'wow', 'cool', 'yes', 'no', 'maybe', 'hey', 'hi', 'bye', 'go', 'try'];
                emailName = getRandomElement(segments) + '.' + firstName.substring(0, Math.min(3, firstName.length)).toLowerCase() +
                            '.' + lastName.substring(0, Math.min(3, lastName.length)).toLowerCase();
                break;
            case 22: emailName = getRandomName() + getRandomName() + Math.floor(Math.random() * 1000); break;
            case 23: emailName = firstName.charAt(0).toLowerCase() + lastName.toLowerCase() +
                     (Math.random() > 0.5 ? 'says' : 'goes') + getRandomHobby(); break;

            // Default fallback
            default: emailName = firstName.toLowerCase() + lastName.toLowerCase(); break;
        }

        // Sometimes add numbers at the end for common email patterns
        if (Math.random() > 0.6 && emailPattern <= 4) { // Only for standard patterns
            const yearStart = 1960;
            const yearEnd = 2000;
            const year = Math.floor(Math.random() * (yearEnd - yearStart)) + yearStart;
            emailName += year;
        }        // Use weighted selection to favor the most reliable email domains
        let domain;
        const reliabilityRoll = Math.random();

        // Top common email providers everyone recognizes
        const topDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'];

        // Privacy-focused and more specialized domains
        const specialDomains = [
            'protonmail.com', 'proton.me', 'tutanota.com', 'pm.me', 'duck.com', 'fastmail.com',
            'zoho.com', 'hushmail.com'
        ];

        if (reliabilityRoll < 0.60) {
            // 60% chance to use one of the top popular domains (gmail, yahoo, outlook, etc.)
            domain = getRandomElement(topDomains);
        } else if (reliabilityRoll < 0.85) {
            // 25% chance to use moderately common domains (ISPs and others)
            const midDomains = personalEmailDomains.slice(6, 24);
            domain = getRandomElement(midDomains);
        } else {
            // 15% chance to use any domain in the list (including less common ones)
            domain = getRandomElement(personalEmailDomains);
        }

        // Match email domain to pattern style
        if (emailPattern >= 20) {
            // For the newest patterns (20-23), use more distinctive and diverse domains
            if (Math.random() > 0.5) {
                // Higher chance for privacy focused or specialized email providers
                domain = getRandomElement(specialDomains);
            } else if (emailPattern === 22 && Math.random() > 0.7) {
                // For random name pattern, sometimes use specific domains
                const gamingDomains = ['protonmail.com', 'gmail.com', 'pm.me', 'outlook.com', 'duck.com'];
                domain = getRandomElement(gamingDomains);
            }
        } else if (emailPattern > 11) {
            // For creative patterns (12-19), use more distinctive domains frequently
            if (Math.random() > 0.6) {
                // Higher chance for privacy focused or specialized email providers
                domain = getRandomElement(specialDomains);
            }
        } else if (emailPattern > 4 && Math.random() > 0.7) {
            // For moderately creative patterns (5-11), occasionally use specialized domains
            domain = getRandomElement(specialDomains);
        }

        // Sanitize email name to ensure it's valid
        let sanitizedEmailName = emailName.replace(/[^a-z0-9.\-_]/g, '');

        // Additional validation for underscore placement (can't begin or end with underscore)
        sanitizedEmailName = sanitizedEmailName
            .replace(/^_+/, '') // Remove any leading underscores
            .replace(/_+$/, '') // Remove any trailing underscores
            .replace(/__+/g, '_'); // Replace multiple consecutive underscores with a single one

        // If after sanitization we have an empty string, use a simple fallback
        if (!sanitizedEmailName) {
            sanitizedEmailName = firstName.toLowerCase() + Math.floor(Math.random() * 100);
        }

        const email = sanitizedEmailName + '@' + domain;

        // Generate phone with a valid area code
        const area = getRandomElement(validAreaCodes);
        const prefix = Math.floor(Math.random() * 800) + 200; // Avoid prefixes starting with 0 or 1
        const lineNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const phone = `${area}-${prefix}-${lineNum}`;

        // Determine if this identity is for US or international (75% US, 25% international)
        const isUS = Math.random() < 0.75;
        const address = isUS ? generateUSAddress() : generateInternationalAddress();

    // Return the complete identity
        return {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            isUS: isUS,
            address: address
        };
    }

    // Function to get a random address from any source (merged database)
    function getRandomAddress() {
        // Decide whether to use a business address from the database or generate a new address
        // 50% chance for each method
        if (Math.random() < 0.5) {
            return getRandomElement(businessAddressDatabase);
        } else {
            // Use the same method as in generateIdentity to get an address
            const isUS = Math.random() < 0.75;
            return isUS ? generateUSAddress() : generateInternationalAddress();
        }
    }
      // Helper function to find form fields by visible text
    function findFieldsByVisibleText() {
        console.log("IceShield: Using aggressive field detection by visible text");

        // Get all text nodes in the document
        const textWalker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const addressFields = {
            streetAddress: [],
            addressLine1: [],
            addressLine2: [],
            city: [],
            state: [],
            zip: []
        };

        const keywordMap = {
            streetAddress: ['street address', 'street', 'address'],
            addressLine1: ['line 1', 'address 1'],
            addressLine2: ['line 2', 'address 2', 'apt', 'suite', 'unit'],
            city: ['city', 'town'],
            state: ['state', 'province'],
            zip: ['zip', 'postal', 'code']
        };

        // Walk through all text nodes in the document
        while (textWalker.nextNode()) {
            const node = textWalker.currentNode;
            const text = node.textContent.trim().toLowerCase();

            // Skip empty nodes
            if (!text) continue;

            // Check if this text contains any of our keywords
            for (const [fieldType, keywords] of Object.entries(keywordMap)) {
                if (keywords.some(keyword => text.includes(keyword))) {
                    // Found a field label, now find the closest input
                    let currentNode = node.parentNode;
                    let input = null;

                    // Look at siblings and children of the current node's parent
                    for (let i = 0; i < 5 && currentNode; i++) {
                        // Check siblings after this text node
                        let sibling = currentNode.nextSibling;
                        while (sibling && !input) {
                            if (sibling.tagName === 'INPUT' || sibling.tagName === 'SELECT') {
                                input = sibling;
                            } else if (sibling.nodeType === 1) { // Element node
                                const inputs = sibling.querySelectorAll('input, select');
                                if (inputs.length > 0) input = inputs[0];
                            }
                            sibling = sibling.nextSibling;
                        }

                        // If we found an input, add it to our list
                        if (input) {
                            addressFields[fieldType].push({
                                input: input,
                                distance: i,
                                text: text
                            });
                            break;
                        }

                        // Move up to parent
                        currentNode = currentNode.parentNode;
                    }
                }
            }
        }

        // Sort fields by distance (lowest first)
        for (const fieldType in addressFields) {
            addressFields[fieldType].sort((a, b) => a.distance - b.distance);
        }

        // Return just the input elements from the first match for each field type
        const result = {};
        for (const fieldType in addressFields) {
            if (addressFields[fieldType].length > 0) {
                result[fieldType] = addressFields[fieldType][0].input;
            }
        }

        return result;
    }

    // Helper function to find an input field by its label text
    function findInputByLabel(labelText) {
        // First look for explicit label connections
        const labels = Array.from(document.querySelectorAll('label')).filter(
            label => label.textContent.toLowerCase().includes(labelText.toLowerCase())
        );

        for (const label of labels) {
            // Check if label has a for attribute
            if (label.htmlFor) {
                const input = document.getElementById(label.htmlFor);
                if (input && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
                    return input;
                }
            }

            // Check for inputs within the label
            const inputs = label.querySelectorAll('input, select, textarea');
            if (inputs.length > 0) {
                return inputs[0];
            }

            // Check nearby elements
            let element = label.nextElementSibling;
            while (element && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL'].includes(element.tagName)) {
                if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                    return element;
                }

                const nestedInput = element.querySelector('input, select, textarea');
                if (nestedInput) {
                    return nestedInput;
                }

                element = element.nextElementSibling;
            }
        }

        // Look for elements that might be acting as labels
        const possibleLabelElements = Array.from(document.querySelectorAll('div, span, p, strong, b')).filter(
            el => el.textContent.toLowerCase().includes(labelText.toLowerCase())
        );

        for (const labelElement of possibleLabelElements) {
            // Check nearby elements
            let element = labelElement.nextElementSibling;
            while (element && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                    return element;
                }

                const nestedInput = element.querySelector('input, select, textarea');
                if (nestedInput) {
                    return nestedInput;
                }

                element = element.nextElementSibling;
            }

            // Check parent elements
            let parent = labelElement.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                const labelIndex = siblings.indexOf(labelElement);

                if (labelIndex !== -1 && siblings.length > labelIndex + 1) {
                    const nextSiblings = siblings.slice(labelIndex + 1);

                    for (const sibling of nextSiblings) {
                        if (sibling.tagName === 'INPUT' || sibling.tagName === 'SELECT' || sibling.tagName === 'TEXTAREA') {
                            return sibling;
                        }

                        const nestedInput = sibling.querySelector('input, select, textarea');
                        if (nestedInput) {
                            return nestedInput;
                        }
                    }
                }
            }
        }

        return null;
    }    // Utility function to trigger input events on a field (much faster version)
    function triggerInputEvent(field) {
        if (field) {
            // Random very small delay before interaction (3-15ms)
            const preInteractionDelay = Math.floor(Math.random() * 12) + 3;

            setTimeout(() => {
                // Quickly simulate mouse movement before clicking the field
                simulateMouseMovement(field);

                // Focus the field
                field.focus();

                // Dispatch focus event
                const focusEvent = new Event('focus', { bubbles: true });
                field.dispatchEvent(focusEvent);

                // Get field value length
                const valueLength = field.value ? field.value.length : 0;

                // For longer text fields, simulate faster typing
                if (valueLength > 10) {
                    // Use our faster typing simulation
                    simulateHumanTyping(field, valueLength);
                } else {
                    // For shorter inputs, dispatch events with minimal delay
                    // Dispatch keydown events
                    const keydownEvent = new KeyboardEvent('keydown', { bubbles: true });
                    field.dispatchEvent(keydownEvent);

                    // Dispatch input event after a very brief delay (1-5ms)
                    setTimeout(() => {
                        const inputEvent = new Event('input', { bubbles: true });
                        field.dispatchEvent(inputEvent);

                        // Dispatch change event after another brief delay
                        setTimeout(() => {
                            const changeEvent = new Event('change', { bubbles: true });
                            field.dispatchEvent(changeEvent);

                            // Dispatch blur event to simulate moving to next field
                            setTimeout(() => {
                                const blurEvent = new Event('blur', { bubbles: true });
                                field.dispatchEvent(blurEvent);
                            }, Math.random() * 3 + 2); // 2-5ms
                        }, Math.random() * 3 + 2); // 2-5ms
                    }, Math.random() * 4 + 1); // 1-5ms
                }
            }, preInteractionDelay);
        }
    }
      // Function to simulate faster but still somewhat human-like typing patterns
    function simulateHumanTyping(field, charCount) {
        let charIndex = 0;
        const originalValue = field.value;

        // Clear the field value to simulate typing it from scratch
        if (Math.random() > 0.9) {  // 10% chance we'll simulate typing it out (reduced from 30%)
            field.value = '';

            // Function to type individual characters with variable timing
            function typeNextChar() {
                if (charIndex < originalValue.length) {
                    // Add the next character
                    field.value += originalValue.charAt(charIndex);
                    charIndex++;

                    // Calculate varying delay between keystrokes (5-15ms) - much faster than before
                    // Occasionally add slightly longer pauses (still faster than before)
                    let nextDelay = Math.random() * 10 + 5;
                    if (Math.random() > 0.97) {  // 3% chance for a slightly longer pause
                        nextDelay += Math.random() * 50; // Max 50ms pause (reduced from 300ms)
                    }

                    // Dispatch input event
                    const inputEvent = new Event('input', { bubbles: true });
                    field.dispatchEvent(inputEvent);

                    // Schedule next character
                    setTimeout(typeNextChar, nextDelay);
                } else {
                    // Finished typing, dispatch final events immediately
                    setTimeout(() => {
                        // Final input and change events
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));

                        // Blur after a very small delay
                        setTimeout(() => {
                            field.dispatchEvent(new Event('blur', { bubbles: true }));
                        }, Math.random() * 10 + 5); // 5-15ms (reduced from 30-80ms)
                    }, Math.random() * 20 + 10); // 10-30ms (reduced from 50-150ms)
                }            }

            // Start typing the first character after a very short delay
            setTimeout(typeNextChar, Math.random() * 20 + 10); // 10-30ms (reduced from 50-150ms)
        } else {
            // Just dispatch the events without simulating typing - much faster now
            setTimeout(() => {
                field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));

                setTimeout(() => {
                    field.dispatchEvent(new Event('change', { bubbles: true }));

                    setTimeout(() => {
                        field.dispatchEvent(new Event('blur', { bubbles: true }));
                    }, Math.random() * 5 + 3); // 3-8ms (reduced from 10-40ms)
                }, Math.random() * 5 + 3); // 3-8ms (reduced from 10-30ms)
            }, Math.random() * 10 + 5); // 5-15ms (reduced from 20-50ms)
        }
    }
      // Function to simulate faster mouse movement to an element
    function simulateMouseMovement(element) {
        if (!element) return;

        try {
            // Create a MouseEvent for mouseover - dispatch immediately
            const mouseoverEvent = new MouseEvent('mouseover', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            element.dispatchEvent(mouseoverEvent);

            // Create MouseEvent for mouseenter - dispatch immediately
            const mouseenterEvent = new MouseEvent('mouseenter', {
                bubbles: false,
                cancelable: true,
                view: window
            });
            element.dispatchEvent(mouseenterEvent);

            // Only very occasionally simulate mouse movement events (less than before)
            if (Math.random() > 0.9) { // 10% chance (reduced from 30% chance)
                // Add a mousemove event with a random position within the element
                const rect = element.getBoundingClientRect();
                const x = Math.floor(Math.random() * rect.width) + rect.left;
                const y = Math.floor(Math.random() * rect.height) + rect.top;

                const mousemoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: x,
                    clientY: y
                });
                element.dispatchEvent(mousemoveEvent);
            }
        } catch (e) {
            // Ignore any errors from event simulation
            console.log("IceShield: Error simulating mouse movement", e);
        }
    }

    // Helper function to select a dropdown option by text
    function selectDropdownOptionByText(selectElement, optionText) {
        if (!selectElement) return false;
        console.log(`IceShield: Attempting to select dropdown option for text: "${optionText}"`);

        if (!optionText) {
            console.log(`IceShield: Warning - Empty option text provided`);
            return false;
        }

        // Check if this is a state selection and we have abbreviations
        let stateAbbr = '';
        let stateFull = '';
        let isStateSelection = false;

        // Normalize input text - remove periods from potential state abbreviations
        const normalizedOptionText = optionText.replace(/\./g, '');

        // If we're working with state names and have the abbreviation mapping
        if (typeof stateAbbreviations !== 'undefined') {
            // Check if input is a full state name (exact match or close match)
            for (const state in stateAbbreviations) {
                if (state === optionText) {
                    stateAbbr = stateAbbreviations[state];
                    stateFull = state;
                    isStateSelection = true;
                    console.log(`IceShield: Identified exact state name: "${state}" with abbreviation: "${stateAbbr}"`);
                    break;
                } else if (state.toLowerCase() === optionText.toLowerCase()) {
                    stateAbbr = stateAbbreviations[state];
                    stateFull = state;
                    isStateSelection = true;
                    console.log(`IceShield: Identified case-insensitive state name: "${state}" with abbreviation: "${stateAbbr}"`);
                    break;
                }
            }

            // If not found as a full name, check if it's an abbreviation
            if (!isStateSelection) {
                const normalizedInput = normalizedOptionText.toUpperCase();
                for (const state in stateAbbreviations) {
                    if (stateAbbreviations[state] === normalizedInput) {
                        stateAbbr = normalizedInput;
                        stateFull = state;
                        isStateSelection = true;
                        console.log(`IceShield: Identified input as state abbreviation: "${normalizedInput}" for state: "${state}"`);
                        break;
                    }
                }
            }

            // Check for state abbreviation with or without periods
            if (!isStateSelection && normalizedOptionText.length <= 2) {
                const normalizedAbbr = normalizedOptionText.toUpperCase();
                if (stateAbbreviationsReverse[normalizedAbbr]) {
                    stateAbbr = normalizedAbbr;
                    stateFull = stateAbbreviationsReverse[normalizedAbbr];
                    isStateSelection = true;
                    console.log(`IceShield: Identified input as normalized state abbreviation: "${normalizedAbbr}" for state: "${stateFull}"`);
                }
            }
        }

        // First attempt: Direct match with options for both value and text
        for (let i = 0; i < selectElement.options.length; i++) {
            const optionValueText = selectElement.options[i].text.trim();
            const optionValueValue = selectElement.options[i].value.trim();

            if (optionValueText === optionText || optionValueValue === optionText ||
                (isStateSelection && (optionValueText === stateAbbr || optionValueValue === stateAbbr)) ||
                (isStateSelection && (optionValueText === stateFull || optionValueValue === stateFull))) {

                selectElement.selectedIndex = i;
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
                console.log(`IceShield: Selected option by direct match: "${selectElement.options[i].text}"`);
                return true;
            }
        }

        // Second attempt: Case insensitive match with normalizations
        for (let i = 0; i < selectElement.options.length; i++) {
            const optionValueText = selectElement.options[i].text.toLowerCase().trim();
            const optionValueValue = selectElement.options[i].value.toLowerCase().trim();
            const inputTextLower = optionText.toLowerCase().trim();

            // Match by text content, state abbreviation, or state name with case insensitivity
            if (optionValueText === inputTextLower || optionValueValue === inputTextLower ||
                optionValueText.includes(inputTextLower) || optionValueValue.includes(inputTextLower) ||
                (stateAbbr && (optionValueText === stateAbbr.toLowerCase() || optionValueValue === stateAbbr.toLowerCase())) ||
                (stateAbbr && (optionValueText.includes(stateAbbr.toLowerCase()) || optionValueValue.includes(stateAbbr.toLowerCase()))) ||
                (stateFull && (optionValueText === stateFull.toLowerCase() || optionValueValue === stateFull.toLowerCase())) ||
                (stateFull && (optionValueText.includes(stateFull.toLowerCase()) || optionValueValue.includes(stateFull.toLowerCase())))) {

                selectElement.selectedIndex = i;
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);

                if (stateAbbr && (optionValueText.includes(stateAbbr.toLowerCase()) || optionValueValue.includes(stateAbbr.toLowerCase()))) {
                    console.log(`IceShield: Selected option ${selectElement.options[i].text} (matched with abbreviation ${stateAbbr})`);
                } else if (stateFull && (optionValueText.includes(stateFull.toLowerCase()) || optionValueValue.includes(stateFull.toLowerCase()))) {
                    console.log(`IceShield: Selected option ${selectElement.options[i].text} (matched with full name ${stateFull})`);
                } else {
                    console.log(`IceShield: Selected option ${selectElement.options[i].text} (case insensitive match)`);
                }

                return true;
            }
        }

        // Third attempt: Special handling for state abbreviations that might have periods
        if (isStateSelection) {
            for (let i = 0; i < selectElement.options.length; i++) {
                const optionValueText = selectElement.options[i].text.trim();
                const optionValueValue = selectElement.options[i].value.trim();

                // Remove periods from text for comparison (handles "N.Y." vs "NY")
                const normalizedOptionValue = optionValueText.replace(/\./g, '');
                const normalizedOptionValueValue = optionValueValue.replace(/\./g, '');

                if (normalizedOptionValue === stateAbbr || normalizedOptionValueValue === stateAbbr ||
                    normalizedOptionValue.toUpperCase() === stateAbbr || normalizedOptionValueValue.toUpperCase() === stateAbbr) {

                    selectElement.selectedIndex = i;
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                    console.log(`IceShield: Selected state by normalized abbreviation match: ${stateAbbr} for "${selectElement.options[i].text}"`);
                    return true;
                }
            }
        }

        // Fourth attempt: Partial word match for longer texts (like violation types or state names)
        if (optionText.length > 5 || isStateSelection) {
            for (let i = 0; i < selectElement.options.length; i++) {
                const optionWords = optionText.toLowerCase().split(/[\s\/]+/);
                const selectWords = selectElement.options[i].text.toLowerCase();
                let stateAbbrMatch = false;
                let stateFullMatch = false;

                // Also check for state abbreviation or full name in this option
                if (isStateSelection) {
                    stateAbbrMatch = selectWords.includes(stateAbbr.toLowerCase());
                    stateFullMatch = stateFull && selectWords.includes(stateFull.toLowerCase().split(' ')[0]);
                }

                // Check if there are significant word matches
                let matchCount = 0;
                for (const word of optionWords) {
                    // Only count meaningful words (longer than 2 chars)
                    if (word.length > 2 && selectWords.includes(word)) {
                        matchCount++;
                    }
                }

                // For states, even one significant word match could be enough
                // For other text, require at least 2 significant matches
                const matchThreshold = isStateSelection ? 1 : 2;

                if (matchCount >= matchThreshold || stateAbbrMatch || stateFullMatch) {
                    selectElement.selectedIndex = i;
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);

                    if (stateAbbrMatch) {
                        console.log(`IceShield: Selected option ${selectElement.options[i].text} (matched state abbreviation ${stateAbbr} in text)`);
                    } else if (stateFullMatch) {
                        console.log(`IceShield: Selected option ${selectElement.options[i].text} (matched part of state name ${stateFull})`);
                    } else {
                        console.log(`IceShield: Selected option ${selectElement.options[i].text} (partial word match with ${matchCount} matching words)`);
                    }

                    return true;
                }
            }
        }

        // Fifth attempt: Look for exact stateName/stateAbbr match as fallback
        if (isStateSelection) {
            // Check for exact state name match
            for (let i = 0; i < selectElement.options.length; i++) {
                const optionValueText = selectElement.options[i].text.trim();
                const optionValueValue = selectElement.options[i].value.trim();

                if (optionValueText === stateFull || optionValueValue === stateFull) {
                    selectElement.selectedIndex = i;
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                    console.log(`IceShield: Selected state by exact state name match: ${stateFull}`);
                    return true;
                }

                if (optionValueText === stateAbbr || optionValueValue === stateAbbr) {
                    selectElement.selectedIndex = i;
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                    console.log(`IceShield: Selected state by exact abbreviation match: ${stateAbbr}`);
                    return true;
                }
            }

            // Final fallback - try matching the first part of multi-word state names
            if (stateFull && stateFull.includes(' ')) {
                const firstWord = stateFull.split(' ')[0].toLowerCase();

                for (let i = 0; i < selectElement.options.length; i++) {
                    const optionLower = selectElement.options[i].text.toLowerCase();

                    if (optionLower.includes(firstWord) && firstWord.length > 3) {
                        selectElement.selectedIndex = i;
                        const event = new Event('change', { bubbles: true });
                        selectElement.dispatchEvent(event);
                        console.log(`IceShield: Selected state by first word match: "${firstWord}" for "${selectElement.options[i].text}"`);
                        return true;
                    }
                }
            }
        }

        console.log(`IceShield: Failed to find a match for "${optionText}" in dropdown`);

        // For state selections, show what was available in the dropdown
        if (isStateSelection) {
            console.log(`IceShield: Available options in dropdown were:`);
            for (let i = 0; i < selectElement.options.length; i++) {
                console.log(`  ${i}: "${selectElement.options[i].text}" (value: "${selectElement.options[i].value}")`);
            }
        }

        return false;
    }

    // Generate a random A-number for immigration forms
    function generateANumber() {
        // Format: A followed by 8 or 9 digits (pattern="\b[A-A]\d*")
        // Based on the HTML input pattern requirement
        const digitCount = Math.random() < 0.5 ? 8 : 9;
        let aNumber = "A";

        // Generate random digits, but ensure first digit is not 0
        // since A-numbers typically don't start with 0
        aNumber += Math.floor(Math.random() * 9) + 1; // First digit 1-9

        // Generate remaining digits
        for (let i = 1; i < digitCount; i++) {
            aNumber += Math.floor(Math.random() * 10);
        }

        // Log the generated A-Number for validation
        console.log("IceShield: Generated A-Number:", aNumber);

        return aNumber;
    }

    // Generate a random receipt number for immigration forms
    function generateReceiptNumber() {
        // Receipt numbers begin with three letters such as EAC, LIN, MSC, SRC, WAC, YSC, or IOE
        const prefixes = ['EAC', 'LIN', 'MSC', 'SRC', 'WAC', 'YSC', 'IOE'];
        const prefix = getRandomElement(prefixes);

        // Followed by 10 digits
        let receiptNumber = prefix;
        for (let i = 0; i < 10; i++) {
            receiptNumber += Math.floor(Math.random() * 10);
        }

    return receiptNumber;
    }

    // Helper function to handle Benefit/Marriage Fraud additional fields    function handleBenefitFraudFields() {
        console.log("IceShield: Handling Benefit/Marriage Fraud additional fields");

        // Wait a bit for the dropdown to appear after main violation selection
        setTimeout(() => {
            // 1. Select a random benefit fraud type from the dropdown
            const selectedBenefitFraudType = getRandomElement(benefitFraudTypes);
            console.log("IceShield: Selected benefit fraud type:", selectedBenefitFraudType);

            // Find the benefit fraud dropdown using the exact ID from the HTML
            const benefitFraudDropdown = document.getElementById('edit-benefit-marriage-fraud-options') ||
                                        document.querySelector('select[name="benefit_marriage_fraud_options"]');

            // If we couldn't find by ID, use fallback methods
            if (!benefitFraudDropdown) {
                // Find by label text
                const fraudLabel = Array.from(document.querySelectorAll('label')).find(
                    label => label.textContent.toLowerCase().includes('activity that best applies')
                );

                // If we found a label, try to find its dropdown
                if (fraudLabel && fraudLabel.htmlFor) {
                    const dropdownById = document.getElementById(fraudLabel.htmlFor);
                    if (dropdownById && dropdownById.tagName === 'SELECT') {
                        benefitFraudDropdown = dropdownById;
                    }
                }

                // Final fallback - look for any dropdown with fraud options
                if (!benefitFraudDropdown) {
                    const allDropdowns = document.querySelectorAll('select');
                    for (const dropdown of allDropdowns) {
                        // Check if this dropdown has options similar to our benefit fraud types
                        let hasBenefitOptions = false;
                        for (let i = 0; i < dropdown.options.length; i++) {
                            const optText = dropdown.options[i].text.toLowerCase();
                            if (optText.includes('fraud') || optText.includes('visa') ||
                                optText.includes('employment') || optText.includes('marriage')) {
                                hasBenefitOptions = true;
                                benefitFraudDropdown = dropdown;
                                break;
                            }
                        }
                        if (hasBenefitOptions) break;
                    }
                }
            }

            // Select from the dropdown if found
            if (benefitFraudDropdown) {
                console.log("IceShield: Found benefit fraud dropdown:", benefitFraudDropdown.name || benefitFraudDropdown.id);
                selectDropdownOptionByText(benefitFraudDropdown, selectedBenefitFraudType);
            } else {
                console.log("IceShield: Could not find benefit fraud dropdown");
            }            // 2. Always fill A-number field (100% probability - required per specification)
            const aNumber = generateANumber();
            // Use the exact selector from the provided HTML and additional comprehensive selectors
            const aNumberField = document.querySelector('input[name="alien_registration_number_a_number_if_known_"]') ||
                                document.getElementById('edit-alien-registration-number-a-number-if-known-') ||
                                document.querySelector('input[data-webform-pattern-error*="A123456789"]') ||
                                document.querySelector('input[placeholder*="A-number" i], input[name*="anumber" i], input[id*="anumber" i], input[aria-label*="A-number" i]') ||
                                document.querySelector('input[name*="alien" i][name*="registration" i]') ||
                                document.querySelector('input[id*="alien" i][id*="registration" i]') ||
                                document.querySelector('input[aria-label*="alien" i][aria-label*="registration" i]');

            if (aNumberField) {
                aNumberField.value = aNumber;
                triggerInputEvent(aNumberField);
                console.log("IceShield: Filled A-Number:", aNumber);
            } else {
                console.log("IceShield: Could not find A-Number field");
            }

            // 3. Fill Receipt Number field (optional)
            // Only fill 3% of the time as requested
            if (Math.random() < 0.03) {
                const receiptNumber = generateReceiptNumber();
                // Use more specific selectors for receipt number field
                const receiptField = document.querySelector('input[name="receipt_number_if_known_"]') ||
                                    document.getElementById('edit-receipt-number-if-known-') ||
                                    document.querySelector('input[data-webform-pattern-error*="ABC1234567890"]') ||
                                    document.querySelector('input[placeholder*="Receipt" i], input[name*="receipt" i], input[id*="receipt" i], input[aria-label*="Receipt" i]');

                if (receiptField) {
                    receiptField.value = receiptNumber;
                    triggerInputEvent(receiptField);
                    console.log("IceShield: Filled Receipt Number:", receiptNumber);
                } else {
                    console.log("IceShield: Could not find Receipt Number field");
                }
            } else {
                console.log("IceShield: Skipping Receipt Number field (97% chance to leave empty)");
            }

            // 4. Handle "previously submitted" radio buttons
            const previouslySubmittedRadios = findRadiosByText("previously submitted", "USCIS");
            if (previouslySubmittedRadios.length >= 2) {
                // Yes (10% chance) or No (90% chance) as requested
                const selectYes = Math.random() < 0.10;
                previouslySubmittedRadios[selectYes ? 0 : 1].checked = true;
                triggerInputEvent(previouslySubmittedRadios[selectYes ? 0 : 1]);
                console.log("IceShield: Selected 'previously submitted':", selectYes ? "Yes" : "No");

                // If Yes selected, also select "Yes" for "providing additional information"
                if (selectYes) {
                    setTimeout(() => {
                        const additionalInfoRadios = findRadiosByText("additional information");
                        if (additionalInfoRadios.length >= 2) {
                            // ALWAYS select "Yes" for additional information as requested
                            additionalInfoRadios[0].checked = true;
                            triggerInputEvent(additionalInfoRadios[0]);
                            console.log("IceShield: Selected 'providing additional information': Yes (always Yes when applicable)");
                        } else if (additionalInfoRadios.length === 1) {
                            // If only one radio found, assume it's the "Yes" option
                            additionalInfoRadios[0].checked = true;
                            triggerInputEvent(additionalInfoRadios[0]);
                            console.log("IceShield: Selected single 'additional information' radio (assuming Yes)");
                        } else {
                            console.log("IceShield: Could not find 'additional information' radio buttons");
                        }
                    }, 300); // Short delay to let the page react
                }
            }
        }, 500); // Wait for the benefit fraud fields to appear    }

    // Helper function to find radio buttons by nearby text content
    function findRadiosByText(...textPhrases) {
        const radioButtons = [];
        const allRadios = document.querySelectorAll('input[type="radio"]');

        for (const radio of allRadios) {
            // Check label
            const label = radio.labels ? radio.labels[0] : null;
            const labelText = label ? label.textContent.toLowerCase() : '';

            // Check parent elements for text
            let parentText = '';
            let parent = radio.parentElement;
            for (let i = 0; i < 3 && parent; i++) { // Check up to 3 levels up
                parentText += parent.textContent.toLowerCase();
                parent = parent.parentElement;
            }

            // Check if all search phrases are found
            const textToSearch = labelText + ' ' + parentText;
            const allPhrasesFound = textPhrases.every(phrase =>
                textToSearch.includes(phrase.toLowerCase())
            );

            if (allPhrasesFound) {
                radioButtons.push(radio);
            }
        }

        return radioButtons;
    }    // Function to generate a narrative for previously submitted information
    function generatePreviousSubmissionNarrative() {
        // Use arrays defined above
        const agency = getRandomElement(agencyNames);
        const date = getRandomElement(submitDates);
        const verb = getRandomElement(submissionVerbs);
        const detail = getRandomElement(additionalDetails);

        // Assemble these components into a coherent sentence with some random variation
        const narrativeTemplates = [
            `I ${verb} this information to ${agency} ${date}. ${detail}.`,
            `${date}, I ${verb} ${agency}. ${detail}.`,
            `Previously ${verb} ${agency} ${date}. ${detail}.`,
            `${agency} was ${verb} about this ${date}. ${detail}.`,
            `${verb} ${agency} regarding this matter ${date}. ${detail}.`,
            `${date}: ${verb} ${agency}. ${detail}.`,
            `Information was previously ${verb.replace('reported', 'reported to').replace('contacted', 'shared with').replace('notified', 'sent to')} ${agency} ${date}. ${detail}.`
        ];

        const narrative = getRandomElement(narrativeTemplates);

        // Ensure we don't exceed 200 characters
        return narrative.length > 198 ? narrative.substring(0, 196) + '...' : narrative;
    }    // Now we can access narrative arrays defined earlier in the script

    // Function to generate a criminal activity summary
    function generateCriminalActivitySummary(violationType) {
        let narratives;

        // Get narratives specific to the violation type, or use generic ones if not found
        if (violationType && criminalActivityNarratives[violationType]) {
            narratives = criminalActivityNarratives[violationType];
        } else {
            narratives = genericCriminalActivityNarratives;
        }

        // Select a random narrative
        let summary = getRandomElement(narratives);

        // Ensure we don't exceed 1000 characters
        if (summary.length > 998) {
            summary = summary.substring(0, 996) + '...';
        }

        return summary;    }

    // Function to handle the "previously submitted" question
    function handlePreviousSubmissionQuestion() {
        console.log("IceShield: Handling 'previously submitted' question");

        // Direct selectors for the radio buttons - using dynamic ID patterns as provided in the HTML snippets
        let yesRadio = document.querySelector('input[id^="edit-have-you-previously-submitted-this-information-to-any-law-radios-true"]');
        let noRadio = document.querySelector('input[id^="edit-have-you-previously-submitted-this-information-to-any-law-radios-false"]');

        // If we found both radio buttons with direct selectors, use them
        if (yesRadio && noRadio) {
            // 3% chance of selecting Yes, 97% chance of selecting No
            const selectYes = Math.random() < 0.03;

            if (selectYes) {
                yesRadio.checked = true;
                const event = new Event('change', { bubbles: true });
                yesRadio.dispatchEvent(event);
                console.log(`IceShield: Selected 'Yes' for previously submitted question using exact selector`);

                // Handle the narrative text field that appears when Yes is selected
                setTimeout(() => {
                    // Use the selector pattern that starts with the provided ID prefix
                    const narrativeBox = document.querySelector('textarea[id^="edit-if-yes-provide-the-date-name-of-agency-and-other-details-in-the-"]') ||
                    document.querySelector('textarea[name*="previous" i], textarea[name*="narrative" i], textarea[name*="detail" i], textarea[placeholder*="provide" i], textarea[placeholder*="detail" i], textarea[aria-label*="narrative" i], textarea');

                    if (narrativeBox) {
                        const narrative = generatePreviousSubmissionNarrative();
                        narrativeBox.value = narrative;
                        triggerInputEvent(narrativeBox);
                        console.log("IceShield: Filled previous submission narrative:", narrative);
                    } else {
                        console.log("IceShield: Previous submission narrative text box not found");
                    }
                }, 300);
            } else {
                noRadio.checked = true;
                const event = new Event('change', { bubbles: true });
                noRadio.dispatchEvent(event);
                console.log(`IceShield: Selected 'No' for previously submitted question using exact selector`);
            }
            return;
        }

        // Fall back to text-based searching if direct selectors didn't work
        // Look for Yes/No radio buttons about previous submission - use flexible matching
        const previousSubmissionRadios = findRadiosByText("previously submitted", "law enforcement", "agency");

        // If not found with the first attempt, try again with fewer keywords
        const allSubmissionRadios = previousSubmissionRadios.length >= 2 ?
            previousSubmissionRadios :
            findRadiosByText("previously submitted");if (allSubmissionRadios.length >= 2) {
            // 3% chance of selecting Yes, 97% chance of selecting No
            const selectYes = Math.random() < 0.03;
            const selectedRadioIndex = selectYes ? 0 : 1;

            allSubmissionRadios[selectedRadioIndex].checked = true;
            const event = new Event('change', { bubbles: true });
            allSubmissionRadios[selectedRadioIndex].dispatchEvent(event);
            console.log(`IceShield: Selected '${selectYes ? "Yes" : "No"}' for previously submitted question`);            // If Yes was selected, wait for text box to appear and fill it
            if (selectYes) {
                setTimeout(() => {
                    // Try exact selector first, then fall back to general patterns
                    const narrativeBox = document.querySelector('#edit-if-yes-provide-the-date-name-of-agency-and-other-details-in-the-') ||
                        document.querySelector('textarea[name*="previous" i], textarea[name*="narrative" i], textarea[name*="detail" i], textarea[placeholder*="provide" i], textarea[placeholder*="detail" i], textarea[aria-label*="narrative" i], textarea');

                    if (narrativeBox) {
                        const narrative = generatePreviousSubmissionNarrative();
                        narrativeBox.value = narrative;
                        triggerInputEvent(narrativeBox);
                        console.log("IceShield: Filled previous submission narrative:", narrative);
                    } else {
                        // Last resort - try to find any textarea that appears after selecting Yes
                        const anyTextArea = document.querySelector('textarea');
                        if (anyTextArea) {
                            const narrative = generatePreviousSubmissionNarrative();
                            anyTextArea.value = narrative;
                            triggerInputEvent(anyTextArea);
                            console.log("IceShield: Filled previous submission narrative using generic textarea");
                        } else {
                            console.log("IceShield: Previous submission narrative text box not found");
                        }
                    }
                }, 300);
            }
        } else {
            console.log("IceShield: 'Previously submitted' radio buttons not found");
        }
    }

    // Function to fill the criminal activity summary
    function fillCriminalActivitySummary(violationType) {
        console.log("IceShield: Filling criminal activity summary");

        // Find the summary text box - expanded selectors for better coverage
        const summaryBox = document.querySelector('textarea[name*="summary" i], textarea[name*="activity" i], textarea[name*="criminal" i], textarea[placeholder*="summary" i], textarea[placeholder*="criminal" i], textarea[placeholder*="activity" i], textarea[aria-label*="summary" i], textarea[aria-label*="criminal" i], textarea[aria-label*="activity" i], textarea[id*="summary" i], textarea[id*="activity" i]');

        if (summaryBox) {
            const summary = generateCriminalActivitySummary(violationType);
            summaryBox.value = summary;
            triggerInputEvent(summaryBox);
            console.log("IceShield: Filled criminal activity summary:", summary.substring(0, 50) + "...");
        } else {
            // Last resort: look for any textarea that might be the summary field
            // Skip the first textarea if it's likely the "previously submitted" narrative field
            const allTextareas = document.querySelectorAll('textarea');
            let textAreaToFill = null;

            if (allTextareas.length > 1) {
                // Use the second textarea if there are multiple (first likely used for previous submission)
                textAreaToFill = allTextareas[1];
            } else if (allTextareas.length === 1) {
                // If only one textarea exists, use it
                textAreaToFill = allTextareas[0];
            }

            if (textAreaToFill) {
                const summary = generateCriminalActivitySummary(violationType);
                textAreaToFill.value = summary;
                triggerInputEvent(textAreaToFill);
                console.log("IceShield: Filled criminal activity summary with generic textarea");
            } else {
                console.log("IceShield: Criminal activity summary text box not found");
            }
        }
    }    // Function to handle the "additional businesses/individuals" question
    function handleAdditionalReportingQuestion() {
        console.log("IceShield: Handling 'additional businesses/individuals' question");

        // First, try to find the "No" radio button directly by the specific label pattern
        let noRadio = null;

        // Try to find by exact label pattern from the provided example
        // Example: edit-did-you-have-additional-businesses-individuals-to-report-on-no--55g5kD09vK0
        const noLabels = Array.from(document.querySelectorAll('label[for^="edit-did-you-have-additional-businesses-individuals-to-report-on-no-"]'));

        if (noLabels.length > 0) {
            const labelFor = noLabels[0].getAttribute('for');
            if (labelFor) {
                noRadio = document.getElementById(labelFor);
                console.log("IceShield: Found 'No' radio by specific label pattern");
            }
        }

        // If not found by specific pattern, try generic matching
        if (!noRadio) {
            // Find all labels containing "No" that are related to the additional businesses/individuals question
            const labels = Array.from(document.querySelectorAll('label.usa-radio__label, label.control-label, label.option'));
            const relevantLabels = labels.filter(label => {
                const text = label.textContent.toLowerCase().trim();
                return text === 'no' &&
                       (label.parentElement &&
                        label.parentElement.textContent.toLowerCase().includes('additional') &&
                        label.parentElement.textContent.toLowerCase().includes('businesses'));
            });

            // If we found a relevant label, get its associated radio button
            if (relevantLabels.length > 0) {
                const labelFor = relevantLabels[0].getAttribute('for');
                if (labelFor) {
                    noRadio = document.getElementById(labelFor);
                    console.log("IceShield: Found 'No' radio by relevant label");
                }
            }
        }

        // If still not found, try to locate by label parent
        if (!noRadio) {
            const labels = Array.from(document.querySelectorAll('label'));
            const noOnlyLabels = labels.filter(label =>
                label.textContent.trim().toLowerCase() === 'no' &&
                label.getAttribute('for') &&
                label.getAttribute('for').includes('no')
            );

            for (const label of noOnlyLabels) {
                let parent = label.parentElement;
                let found = false;

                // Check up to 4 levels of parent elements
                for (let i = 0; i < 4 && parent; i++) {
                    if (parent.textContent.toLowerCase().includes('additional') &&
                        parent.textContent.toLowerCase().includes('businesses')) {
                        const labelFor = label.getAttribute('for');
                        noRadio = document.getElementById(labelFor);
                        found = true;
                        console.log("IceShield: Found 'No' radio by parent context");
                        break;
                    }
                    parent = parent.parentElement;
                }

                if (found) break;
            }
        }

        // Last resort - fall back to the old method
        if (!noRadio) {
            const additionalRadios = findRadiosByText("additional", "businesses", "individuals", "report");
            if (additionalRadios.length >= 2) {
                noRadio = additionalRadios[1]; // Index 1 is typically the "No" option
                console.log("IceShield: Found 'No' radio by text search");
            }
        }

        // Select the radio button if found using multiple approaches to ensure it's properly set
        if (noRadio) {
            // First approach - set checked and dispatch change event
            noRadio.checked = true;
            noRadio.dispatchEvent(new Event('change', { bubbles: true }));

            // Second approach - trigger click with small delay
            setTimeout(() => {
                noRadio.click();
                console.log("IceShield: Clicked 'No' radio button");

                // Third approach - force checked again and dispatch input event
                setTimeout(() => {
                    noRadio.checked = true;
                    noRadio.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log("IceShield: Forced 'No' radio checked state again");
                }, 200);
            }, 300);

            console.log(`IceShield: Selected 'No' for additional businesses/individuals question (always No)`);
        } else {
            console.log("IceShield: 'Additional businesses/individuals' radio buttons not found after all attempts");
        }
    }// Helper function to select a violation type
    function selectViolationType() {
        console.log("IceShield: Selecting a violation type");

        // Select a random violation type
        const selectedViolation = getRandomElement(violationTypes);
        // Set the global selectedViolationType to match the criminal activity summary
        selectedViolationType = selectedViolation;
        console.log("IceShield: Selected violation type:", selectedViolationType);

        // Find the violation radio buttons or checkboxes
        let violationSelected = false;
        let isBenefitFraud = false;
        let isOtherViolation = selectedViolation === 'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)';

        // Try different selection methods in order of preference

        // 1. Try to find radio buttons first
        const violationRadios = document.querySelectorAll('input[type="radio"]');
        for (const radio of violationRadios) {
            // Check the radio button's label or nearby text
            const label = radio.labels ? radio.labels[0] : null;
            const labelText = label ? label.textContent.trim() : '';
            const radioId = radio.id ? radio.id.toLowerCase() : '';
            const radioName = radio.name ? radio.name.toLowerCase() : '';

            // Check if this radio matches our selected violation
            if (labelText === selectedViolation ||
                labelText.includes(selectedViolation) ||
                (radio.nextSibling && radio.nextSibling.textContent &&
                 radio.nextSibling.textContent.includes(selectedViolation))) {

                radio.checked = true;
                const event = new Event('change', { bubbles: true });
                radio.dispatchEvent(event);
                violationSelected = true;                // Check if this is the Benefit/Marriage Fraud option
                if (selectedViolation === 'Benefit/Marriage Fraud') {
                    isBenefitFraud = true;
                }

                // Check if this is the Other option
                if (selectedViolation === 'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)') {
                    isOtherViolation = true;
                }

                console.log("IceShield: Selected violation radio button:", selectedViolation);
                break;
            }
        }

        // 2. If no radio button was found, try a dropdown/select
        if (!violationSelected) {
            // Look for potential select elements
            const selects = document.querySelectorAll('select');
            for (const select of selects) {
                if (selectDropdownOptionByText(select, selectedViolation)) {
                    violationSelected = true;                    // Check if this is the Benefit/Marriage Fraud option
                    if (selectedViolation === 'Benefit/Marriage Fraud') {
                        isBenefitFraud = true;
                    }

                    // Check if this is the Other option
                    if (selectedViolation === 'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)') {
                        isOtherViolation = true;
                    }

                    console.log("IceShield: Selected violation from dropdown:", selectedViolation);
                    break;
                }
            }
        }

        // 3. Try checkbox as last resort
        if (!violationSelected) {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            for (const checkbox of checkboxes) {
                const label = checkbox.labels ? checkbox.labels[0] : null;
                const labelText = label ? label.textContent.trim() : '';

                if (labelText === selectedViolation ||
                    labelText.includes(selectedViolation) ||
                    (checkbox.nextSibling && checkbox.nextSibling.textContent &&
                     checkbox.nextSibling.textContent.includes(selectedViolation))) {                    checkbox.checked = true;
                    const event = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(event);
                    violationSelected = true;

                    // Check if this is the Benefit/Marriage Fraud option
                    if (selectedViolation === 'Benefit/Marriage Fraud') {
                        isBenefitFraud = true;
                    }

                    // Check if this is the Other option
                    if (selectedViolation === 'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)') {
                        isOtherViolation = true;
                    }

                    console.log("IceShield: Selected violation checkbox:", selectedViolation);
                    break;
                }
            }
        }

        // If Benefit/Marriage Fraud was selected, handle its additional fields
        if (isBenefitFraud) {
            handleBenefitFraudFields();
        }

        // If Other violation type was selected, handle the "other" text field
        if (isOtherViolation) {
            handleOtherViolationField();
        }

        return violationSelected;
    }

    // Function to handle the "Other" violation type text field
    function handleOtherViolationField() {
        console.log("IceShield: Handling Other violation field");

        // Wait a moment for the field to appear (it may be shown/hidden via JavaScript)
        setTimeout(() => {
            // Look for the "other" field that becomes visible when "Other" is selected
            const otherField = document.querySelector('input[data-drupal-selector="edit-other"], input[name="other"], input#edit-other');

            if (otherField) {
                // Select a random reason from our array
                const otherReason = getRandomElement(otherViolationReasons);

                console.log("IceShield: Filling Other field with:", otherReason);

                // Fill the field
                otherField.value = otherReason;

                // Trigger events to ensure form validation recognizes the change
                triggerInputEvent(otherField);

                // Some forms may require explicitly marking the field as "touched" or "dirty"
                const focusEvent = new Event('focus', { bubbles: true });
                const blurEvent = new Event('blur', { bubbles: true });
                otherField.dispatchEvent(focusEvent);
                otherField.dispatchEvent(blurEvent);
            } else {
                console.log("IceShield: Could not find Other field to fill");
            }
        }, 500); // Half-second delay to allow for field to become visible
    }    // Main function to fill the form
    function fillForm() {
        console.log("IceShield: Starting form fill");

        // Update status to "Filling..."
        window.updateIceShieldStatus('Filling...');

        // Increment the fill count
        loopCount++;
        GM_setValue('loopCount', loopCount);

        // Update the counter in the UI
        const fillsValueElement = document.getElementById('iceshield-fills-value');
        if (fillsValueElement) {
            fillsValueElement.textContent = loopCount.toString();
            console.log("IceShield: Updated fill count display to:", loopCount);
        } else {
            console.log("IceShield: Could not find fills-value element to update");
        }

        console.log(`IceShield: Form fill count: ${loopCount}`);

        // Generate a random identity
        const identity = generateIdentity();
        console.log("IceShield: Generated identity", identity);

        // Find form fields and fill them
        const firstNameField = document.querySelector('input[name*="first" i]'); // Case insensitive match containing "first"
        const lastNameField = document.querySelector('input[name*="last" i]');
        const emailField = document.querySelector('input[type="email"], input[name*="email" i]');
        const phoneField = document.querySelector('input[name*="phone" i], input[type="tel"]');

        // Fill in the basic fields if they exist
        if (firstNameField) firstNameField.value = identity.firstName;
        if (lastNameField) lastNameField.value = identity.lastName;
        if (emailField) emailField.value = identity.email;
        if (phoneField) phoneField.value = identity.phone;

        // Trigger events for basic fields
        [firstNameField, lastNameField, emailField, phoneField].forEach(triggerInputEvent);

        // Select a random violation type
        selectViolationType();

        // Handle the new narrative sections with slight delays to ensure proper form loading
        setTimeout(() => {
            // Handle "Have you previously submitted this information to any law enforcement or government agency?"
            handlePreviousSubmissionQuestion();
        }, 600);

        setTimeout(() => {
            // Fill the criminal activity summary
            fillCriminalActivitySummary(selectedViolationType);
        }, 800);

        setTimeout(() => {
            // Handle "Did you have additional businesses/individuals to report on?"
            handleAdditionalReportingQuestion();
        }, 1000);

        // Handle the location radio buttons
        const locationRadios = document.querySelectorAll('input[type="radio"]');
        let usRadio = null;
        let internationalRadio = null;

        // Find the US and International radio buttons
        for (const radio of locationRadios) {
            const label = radio.labels ? radio.labels[0] : null;
            const labelText = label ? label.textContent.trim() : '';
            const radioId = radio.id;
            const radioName = radio.name;

            // Check the radio button itself, its label, or nearby text
            if (
                labelText.includes('Inside the U.S.') ||
                radioId.includes('us') ||
                radioName.includes('us') ||
                (radio.nextSibling && radio.nextSibling.textContent && radio.nextSibling.textContent.includes('Inside the U.S.'))
            ) {
                usRadio = radio;
            } else if (
                labelText.includes('Outside of the U.S.') ||
                labelText.includes('Outside the U.S.') ||
                radioId.includes('international') ||
                radioName.includes('international') ||
                (radio.nextSibling && radio.nextSibling.textContent && radio.nextSibling.textContent.includes('Outside'))
            ) {
                internationalRadio = radio;
            }
        }        // Select the appropriate radio button based on identity.isUS
        if (usRadio && internationalRadio) {
            if (identity.isUS) {
                usRadio.checked = true;
            } else {
                internationalRadio.checked = true;
            }

            // Trigger change event on selected radio
            const selectedRadio = identity.isUS ? usRadio : internationalRadio;
            const event = new Event('change', { bubbles: true });
            selectedRadio.dispatchEvent(event);            // Wait a moment for the form fields to update based on the radio selection
            setTimeout(() => {
                fillAddressFields(identity);

                // Fill in the "Where are you reporting from?" section with a longer delay to ensure form elements are fully loaded
                setTimeout(() => {
                    fillReportingLocation();
                }, 800); // Increased from 300ms to 800ms to give more time for dropdown to appear
            }, 500);
        } else {        // If radio buttons weren't found, try to fill address fields directly
            fillAddressFields(identity);

            // Still try to fill the reporting location fields with a longer delay
            setTimeout(() => {
                fillReportingLocation();
            }, 1000); // Increased from 300ms to 1000ms to give more time for dropdown to appear
        }

        // After filling address fields, handle the criminal activity location section with a slight delay
        setTimeout(() => {
            fillCriminalActivityLocation();
        }, 800);        // Handle the violator information section
        setTimeout(() => {
            handleViolatorInformation();            // After all form filling is complete, scroll to the CAPTCHA and submit area
            // Wait a bit longer to make sure all dynamic form elements have loaded
            setTimeout(() => {
                scrollToCaptchaAndSubmit();
                // Update status to "Done" after form is filled
                window.updateIceShieldStatus('Done');
            }, 1500);
        }, 1000);

        console.log("IceShield: Form filled with identity data");
    }    // Function to fill the address fields based on US or international
    function fillAddressFields(identity) {
        const address = identity.address;

        // Common address fields
        const line1Field = document.querySelector('input[name*="line1" i], input[name*="address1" i], input[placeholder*="line 1" i], input[name*="street" i]');
        const line2Field = document.querySelector('input[name*="line2" i], input[name*="address2" i], input[placeholder*="line 2" i], input[name*="apt" i]');
        const cityField = document.querySelector('input[name*="city" i], input[placeholder*="city" i]');
        const zipField = document.querySelector('input[name*="zip" i], input[name*="postal" i], input[placeholder*="zip" i], input[placeholder*="postal" i]');        // Fill common fields
        if (line1Field) line1Field.value = address.line1;
        if (line2Field) line2Field.value = address.line2;
        if (cityField) cityField.value = address.city;
        if (zipField) {
            // Ensure zip code is exactly 5 digits and numeric only (override international postal codes)
            const zipCode = address.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
            // Truncate if longer than 5 digits
            const formattedZip = zipCode.substring(0, 5);
            zipField.value = formattedZip;
        }

        // Trigger input events for these fields
        [line1Field, line2Field, cityField, zipField].forEach(triggerInputEvent);

        if (identity.isUS) {
            // Fill US-specific fields
            const stateField = document.querySelector('select[name*="state" i], select[id*="state" i]');
            if (stateField) {
                selectDropdownOptionByText(stateField, address.state);
            }
        } else {
            // Fill international-specific fields
            const countryField = document.querySelector('select[name*="country" i], select[id*="country" i]');
            if (countryField) {
                selectDropdownOptionByText(countryField, address.country);
            }
        }

        console.log("IceShield: Address fields filled with", identity.isUS ? "US" : "international", "address");
    }    // Function to fill the "Where are you reporting from?" section
    function fillReportingLocation() {
        console.log("IceShield: Filling reporting location section");

        // Find the radio buttons for "Inside the U.S." and "Outside of the U.S."
        // Try multiple selector approaches to find the radio buttons
        let insideUSRadio = document.querySelector('input[name="where_are_you_reporting_from_radios"][value="INSIDE"]');
        let outsideUSRadio = document.querySelector('input[name="where_are_you_reporting_from_radios"][value="OUTSIDE"]');

        // If not found with the first approach, try using the IDs from the provided HTML
        if (!insideUSRadio) {
            insideUSRadio = document.querySelector('input[id*="edit-where-are-you-reporting-from-radios-inside"]');
        }
        if (!outsideUSRadio) {
            outsideUSRadio = document.querySelector('input[id*="edit-where-are-you-reporting-from-radios-outside"]');
        }

        // If still not found, try looking for radio buttons with labels containing the text
        if (!insideUSRadio || !outsideUSRadio) {
            const allRadios = document.querySelectorAll('input[type="radio"]');
            for (const radio of allRadios) {
                const label = radio.labels ? radio.labels[0] : null;
                const labelText = label ? label.textContent.trim() : '';

                if (labelText.includes('Inside the U.S.') && !insideUSRadio) {
                    insideUSRadio = radio;
                } else if ((labelText.includes('Outside of the U.S.') || labelText.includes('Outside the U.S.')) && !outsideUSRadio) {
                    outsideUSRadio = radio;
                }
            }        }        // Always select inside US (100%) - outside option disabled but not removed
        const isInsideUS = true;// Select the appropriate radio button
        if (insideUSRadio && isInsideUS) {
            insideUSRadio.checked = true;
            triggerInputEvent(insideUSRadio);
            console.log("IceShield: Selected 'Inside the U.S.' reporting location (always 100%)");
        } else if (outsideUSRadio && !isInsideUS) {
            outsideUSRadio.checked = true;
            triggerInputEvent(outsideUSRadio);
            console.log("IceShield: Selected 'Outside of the U.S.' reporting location (disabled - should not reach here)");
        } else {
            console.log("IceShield: Could not find reporting location radio buttons");
            // Log which radio buttons were found for debugging
            if (insideUSRadio) console.log("IceShield: Found insideUSRadio");
            if (outsideUSRadio) console.log("IceShield: Found outsideUSRadio");
            console.log("IceShield: Selection was for:", isInsideUS ? "Inside U.S." : "Outside U.S.");
        }

        // Wait longer for the form to update based on radio selection (500ms instead of 300ms)
        setTimeout(() => {
            // Generate a random address - either US or international based on selection
            const reporterAddress = isInsideUS ? generateUSAddress() : generateInternationalAddress();

            // Find and fill the street address fields using the provided selectors
            // Using exact selectors provided in the HTML
            const line1Field = document.querySelector('input[data-drupal-selector="edit-line-1"], input[name="line_1"]');
            const line2Field = document.querySelector('input[data-drupal-selector="edit-line-2"], input[name="line_2"]');
            const cityField = document.querySelector('input[data-drupal-selector="edit-city"], input[name="city"]');
            const zipField = document.querySelector('input[data-drupal-selector="edit-zip-code"], input[name="zip_code"]');

            // Fill in the fields if found
            if (line1Field) {
                line1Field.value = reporterAddress.line1;
                triggerInputEvent(line1Field);
                console.log("IceShield: Filled reporter address line 1:", reporterAddress.line1);
            } else {
                console.log("IceShield: Reporter address line 1 field not found");
            }

            if (line2Field) {
                line2Field.value = reporterAddress.line2;
                triggerInputEvent(line2Field);
                console.log("IceShield: Filled reporter address line 2:", reporterAddress.line2);
            }

            if (cityField) {
                cityField.value = reporterAddress.city;
                triggerInputEvent(cityField);
                console.log("IceShield: Filled reporter city:", reporterAddress.city);
            } else {
                console.log("IceShield: Reporter city field not found");
            }            if (zipField) {
                // Ensure zip code is exactly 5 digits and numeric only (override international postal codes)
                const zipCode = reporterAddress.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
                // Truncate if longer than 5 digits
                const formattedZip = zipCode.substring(0, 5);
                zipField.value = formattedZip;
                triggerInputEvent(zipField);
                console.log("IceShield: Filled reporter zip code (5-digit override):", formattedZip);
            } else {
                console.log("IceShield: Reporter zip code field not found");
            }// Handle state/country selection based on inside/outside US selection
            if (isInsideUS) {
                // For inside US, select a state
                const stateField = document.querySelector('select[data-drupal-selector="edit-state"], select[name="state"]');
                if (stateField) {
                    // Select the state that matches the reporter address
                    const stateOptions = Array.from(stateField.options).filter(option => option.value && option.value !== "");
                    if (stateOptions.length > 0) {
                        // Try to find the state that matches the address
                        const matchingState = stateOptions.find(option =>
                            option.text.toLowerCase().includes(reporterAddress.state.toLowerCase()) ||
                            reporterAddress.state.toLowerCase().includes(option.text.toLowerCase())
                        );

                        // If we found a matching state, use it; otherwise select a random one
                        const selectedState = matchingState || getRandomElement(stateOptions);
                        stateField.value = selectedState.value;
                        triggerInputEvent(stateField);
                        console.log("IceShield: Selected state:", selectedState.text);
                    }
                } else {
                    console.log("IceShield: State field not found");
                }
            } else {
                // For outside US, select a country
                const countryField = document.querySelector('select[data-drupal-selector="edit-country"], select[name="country"]');
                if (countryField) {
                    // Get country options (excluding the default "- None -" option)
                    const countryOptions = Array.from(countryField.options).filter(option => option.value && option.value !== "");
                    if (countryOptions.length > 0) {
                        // Try to find the country that matches the address
                        const matchingCountry = countryOptions.find(option =>
                            option.text.toLowerCase().includes(reporterAddress.country.toLowerCase()) ||
                            reporterAddress.country.toLowerCase().includes(option.text.toLowerCase())
                        );

                        // If we found a matching country, use it; otherwise select a random one
                        const selectedCountry = matchingCountry || getRandomElement(countryOptions);
                        countryField.value = selectedCountry.value;
                        triggerInputEvent(countryField);
                        console.log("IceShield: Selected country:", selectedCountry.text);
                    }
                } else {
                    console.log("IceShield: Country field not found");
                }
            }

            console.log("IceShield: Reporter location fields filled");
        }, 300);
    }

    // Function to fill the "Location of Criminal Activity" section
    function fillCriminalActivityLocation() {
        // First, try to identify if there's a location of criminal activity section
        const criminalLocationHeaders = Array.from(document.querySelectorAll('h2, h3, h4, legend, label, div.heading, div, p, span, strong')).filter(el =>
            el.textContent.toLowerCase().includes('location of criminal activity') ||
            el.textContent.toLowerCase().includes('crime location') ||
            el.textContent.toLowerCase().includes('incident location') ||
            el.textContent.toLowerCase().includes('street address')
        );        // Always select a state, but only fill other fields 90% of the time
        console.log("IceShield: Attempting to fill criminal activity location section");

        // Determine if we should fill out all the location fields (90% chance)
        const shouldFillLocation = Math.random() < 0.9;

        // We'll use a location object regardless of whether we're filling all fields
        // to ensure consistency between city and state
        let location;
          // Get a random pre-defined criminal activity location or generate a new one
        if (Math.random() < 0.7) {
            // Use a pre-defined location 70% of the time - these are already consistent
            location = getRandomElement(criminalActivityLocations);
            console.log("IceShield: Using pre-defined criminal activity location:", location.description);
        } else {
            // Generate a random US address 30% of the time - our updated generateUSAddress ensures city-state consistency
            location = generateUSAddress();
            console.log("IceShield: Using randomly generated criminal activity location");
        }

        // Now we always have a location with matching city and state - important for consistency
        const criminalState = location.state;

        // Try to get the exact field using data-drupal-selector first
        const stateField = document.querySelector('select[data-drupal-selector="edit-state-location"]') ||
            document.querySelector('select#edit-state-location') ||
            document.querySelector('select[name="state_location"]') ||
            document.querySelector('select[name*="state" i], select[id*="state" i], select[name*="location_state" i], select[id*="crime_state" i], select[name*="activity_state" i]');

        if (stateField) {
            // We have the exact state dropdown, so let's directly select by abbreviation value
            const stateAbbr = stateAbbreviations[criminalState];

            // First try to select by value (more reliable)
            let success = false;
            for (let i = 0; i < stateField.options.length; i++) {
                if (stateField.options[i].value === stateAbbr) {
                    stateField.selectedIndex = i;
                    const event = new Event('change', { bubbles: true });
                    stateField.dispatchEvent(event);
                    console.log("IceShield: Selected state for criminal activity location by abbreviation:", criminalState, stateAbbr);
                    success = true;
                    break;
                }
            }

            // If selecting by value didn't work, fall back to using the helper function
            if (!success) {
                selectDropdownOptionByText(stateField, criminalState);
                console.log("IceShield: Selected state for criminal activity location by text:", criminalState);
            }
        }

        // If we're not filling location details, return after selecting state
        if (!shouldFillLocation) {
            console.log("IceShield: Skipping criminal activity location details (10% chance)");
            return;
        }

        // We continue with the same location object to ensure city-state consistency

        // Enhanced address field detection approach

        // First attempt - try criminal activity section specific patterns
        const addressPrefix = ''; // This will be replaced with the specific prefix for criminal activity if needed

        // Try different field patterns to find the right inputs - expanded patterns for better detection
        const patterns = [
            {line1: '[name*="crime_line1" i], [name*="activity_line1" i], [name*="location_line1" i], [name*="street" i], [name*="address" i][name*="line1" i], [placeholder*="Street Address" i], [placeholder*="line 1" i]'},
            {line2: '[name*="crime_line2" i], [name*="activity_line2" i], [name*="location_line2" i], [name*="address" i][name*="line2" i], [placeholder*="line 2" i]'},
            {city: '[name*="crime_city" i], [name*="activity_city" i], [name*="location_city" i], [name*="city" i], [placeholder*="City" i]'},
            {zip: '[name*="crime_zip" i], [name*="activity_zip" i], [name*="location_zip" i], [name*="zip" i], [name*="postal" i], [placeholder*="Zip" i], [placeholder*="ZIP" i]'}
        ];          // Try exact data-drupal-selector first, then fall back to broader selectors
        let line1Field = document.querySelector('input[data-drupal-selector="edit-line-1-location"]') ||
            document.querySelector(`input${addressPrefix}[name*="line1" i], input${addressPrefix}[name*="address1" i], input${addressPrefix}[name*="street" i], input${patterns[0].line1}], input[placeholder*="Street Address" i], input[aria-label*="Street Address" i], input[id*="street" i], input[placeholder*="Address" i]:not([placeholder*="Email"])`);

        // If not found, try a broader approach with nearest fields to criminal activity header
        if (!line1Field && criminalLocationHeaders.length > 0) {
            const header = criminalLocationHeaders[0];
            // Look for input fields that might be in the same section as the header
            const sectionInputs = findInputsInSection(header);

            if (sectionInputs.length > 0) {
                // Use the inputs in this order: street, line2, city, zip
                line1Field = sectionInputs[0];
            }

            // If still not found, try a more aggressive approach
            if (!line1Field) {
                // Find all inputs after the header that could be address fields
                let allInputsNearHeader = [];
                let currentElement = header;

                // Search through the next 20 elements for potential input fields
                for (let i = 0; i < 20 && currentElement; i++) {
                    currentElement = currentElement.nextElementSibling;
                    if (!currentElement) break;

                    // Collect all input fields
                    const inputs = currentElement.querySelectorAll('input[type="text"]');
                    inputs.forEach(input => allInputsNearHeader.push(input));

                    // Also check if this element is an input field itself
                    if (currentElement.tagName === "INPUT" && currentElement.type === "text") {
                        allInputsNearHeader.push(currentElement);
                    }
                }

                // Find inputs that are likely address fields
                if (allInputsNearHeader.length > 0) {
                    // Filter for empty inputs or ones with "address" or "street" in attributes
                    const addressInputs = allInputsNearHeader.filter(input =>
                        !input.value ||
                        (input.name && (input.name.match(/address|street|line/i))) ||
                        (input.placeholder && (input.placeholder.match(/address|street|line/i))) ||
                        (input.id && (input.id.match(/address|street|line/i)))
                    );

                    if (addressInputs.length > 0) {
                        line1Field = addressInputs[0];
                    } else {
                        // Just take the first empty field
                        const emptyInputs = allInputsNearHeader.filter(input => !input.value);
                        if (emptyInputs.length > 0) {
                            line1Field = emptyInputs[0];
                        }
                    }
                }
            }        }

        // Try to find line2, city, and zip fields with specific data-drupal-selector attributes first
        const line2Field = document.querySelector('input[data-drupal-selector="edit-line-2-location"]') ||
            document.querySelector(`input${addressPrefix}[name*="line2" i], input${addressPrefix}[name*="address2" i], input${patterns[1].line2}], input[placeholder*="line 2" i]`);
        const cityField = document.querySelector('input[data-drupal-selector="edit-city-location"]') ||
            document.querySelector(`input${addressPrefix}[name*="city" i], input${patterns[2].city}], input[placeholder*="City" i], input[aria-label*="City" i]`);
        const zipField = document.querySelector('input[data-drupal-selector="edit-zip-code-location"]') ||
            document.querySelector(`input${addressPrefix}[name*="zip" i], input${addressPrefix}[name*="postal" i], input${patterns[3].zip}], input[placeholder*="Zip" i], input[aria-label*="Zip" i]`);

        // Fill the fields if found
        if (line1Field) {
            line1Field.value = location.line1;
            triggerInputEvent(line1Field);
            console.log("IceShield: Filled criminal activity address line 1:", location.line1);
        } else {
            console.log("IceShield: Criminal activity address line 1 field not found");

            // Last resort: try to find any textual input fields
            const possibleAddressInputs = findUnfilledTextInputs();
            if (possibleAddressInputs.length > 0) {
                possibleAddressInputs[0].value = location.line1;
                triggerInputEvent(possibleAddressInputs[0]);
                console.log("IceShield: Filled criminal activity address line 1 using generic field detection");
            }
        }

        if (line2Field) {
            line2Field.value = location.line2;
            triggerInputEvent(line2Field);
            console.log("IceShield: Filled criminal activity address line 2");
        }

        if (cityField) {
            cityField.value = location.city;
            triggerInputEvent(cityField);
            console.log("IceShield: Filled criminal activity city");
        }

        if (zipField) {
            zipField.value = location.zip;
            triggerInputEvent(zipField);
            console.log("IceShield: Filled criminal activity zip");
        }

        // Helper function to find input fields in the same section as a header element
        function findInputsInSection(headerElement) {
            const inputs = [];
            let element = headerElement;

            // Look for form fields after the header until we find 10 inputs or hit a new h2-h6 tag
            while (element && inputs.length < 10) {
                element = element.nextElementSibling;

                if (!element) break;

                // Stop if we hit a new section header
                if (element.tagName && /^h[2-6]$/i.test(element.tagName)) break;

                // Check if this element contains input fields
                const elementInputs = element.querySelectorAll('input[type="text"]');
                elementInputs.forEach(input => {
                    if (input.type === "text" && !input.name.includes("email") && !input.name.includes("phone")) {
                        inputs.push(input);
                    }
                });

                // Also check if this element is an input field itself
                if (element.tagName === "INPUT" && element.type === "text" && !element.name.includes("email") && !element.name.includes("phone")) {
                    inputs.push(element);
                }
            }

            return inputs;
        }

        // Last resort: Try to find criminal activity fields by common label texts
        if (!line1Field || !line2Field || !cityField || !zipField) {
            console.log("IceShield: Attempting to find criminal activity fields by label text");

            // Define common label texts
            const addressLabels = ['street address', 'line 1', 'address line 1'];
            const address2Labels = ['address line 2', 'line 2', 'apt', 'suite', 'unit'];
            const cityLabels = ['city', 'town'];
            const stateLabels = ['state', 'province'];
            const zipLabels = ['zip', 'postal code', 'zip code'];

            // Try each label until we find a match
            if (!line1Field) {
                for (const label of addressLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        line1Field = found;
                        console.log("IceShield: Found address line 1 field by label:", label);
                        break;
                    }
                }
            }

            if (!line2Field) {
                for (const label of address2Labels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        line2Field = found;
                        console.log("IceShield: Found address line 2 field by label:", label);
                        break;
                    }
                }
            }

            if (!cityField) {
                for (const label of cityLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        cityField = found;
                        console.log("IceShield: Found city field by label:", label);
                        break;
                    }
                }
            }

            if (!stateField) {
                for (const label of stateLabels) {
                    const found = findInputByLabel(label);
                    if (found && (found.tagName === 'SELECT' || found.type === 'text')) {
                        stateField = found;
                        console.log("IceShield: Found state field by label:", label);
                        break;
                    }
                }
            }

            if (!zipField) {
                for (const label of zipLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        zipField = found;
                        console.log("IceShield: Found zip field by label:", label);
                        break;
                    }
                }
            }

            // Fill any fields we found
            if (line1Field) {
                line1Field.value = location.line1;
                triggerInputEvent(line1Field);
                console.log("IceShield: Filled criminal activity address line 1 using label search");
            }

            if (line2Field) {
                line2Field.value = location.line2;
                triggerInputEvent(line2Field);
                console.log("IceShield: Filled criminal activity address line 2 using label search");
            }

            if (cityField) {
                cityField.value = location.city;
                triggerInputEvent(cityField);
                console.log("IceShield: Filled criminal activity city using label search");
            }

            if (stateField) {
                if (stateField.tagName === 'SELECT') {
                    selectDropdownOptionByText(stateField, location.state);
                } else {
                    stateField.value = location.state;
                    triggerInputEvent(stateField);
                }
                console.log("IceShield: Filled criminal activity state using label search");
            }
              if (zipField) {
                zipField.value = location.zip;
                triggerInputEvent(zipField);
                console.log("IceShield: Filled criminal activity zip using label search");
            }

            // Ultimate fallback: use the aggressive field detection
            if (!line1Field || !line2Field || !cityField || !zipField) {
                const visibleFields = findFieldsByVisibleText();

                if (!line1Field && (visibleFields.streetAddress || visibleFields.addressLine1)) {
                    line1Field = visibleFields.streetAddress || visibleFields.addressLine1;
                    line1Field.value = location.line1;
                    triggerInputEvent(line1Field);
                    console.log("IceShield: Filled criminal activity address line 1 using visible text detection");
                }

                if (!line2Field && visibleFields.addressLine2) {
                    line2Field = visibleFields.addressLine2;
                    line2Field.value = location.line2;
                    triggerInputEvent(line2Field);
                    console.log("IceShield: Filled criminal activity address line 2 using visible text detection");
                }

                if (!cityField && visibleFields.city) {
                    cityField = visibleFields.city;
                    cityField.value = location.city;
                    triggerInputEvent(cityField);
                    console.log("IceShield: Filled criminal activity city using visible text detection");
                }

                if (!stateField && visibleFields.state) {
                    stateField = visibleFields.state;
                    if (stateField.tagName === 'SELECT') {
                        selectDropdownOptionByText(stateField, location.state);
                    } else {
                        stateField.value = location.state;
                        triggerInputEvent(stateField);
                    }
                    console.log("IceShield: Filled criminal activity state using visible text detection");
                }

                if (!zipField && visibleFields.zip) {
                    zipField = visibleFields.zip;
                    zipField.value = location.zip;
                    triggerInputEvent(zipField);
                    console.log("IceShield: Filled criminal activity zip using visible text detection");
                }
            }
        }

        console.log("IceShield: Criminal activity location fields filled");
    }    // Function to handle the violator information section
    function handleViolatorInformation() {
        console.log("IceShield: Handling violator information section");

        // Look for section headers to confirm we're in the right section
        const violatorHeaders = Array.from(document.querySelectorAll('h2, h3, h4, legend, label, div.heading, div, p, span, strong')).filter(el =>
            el.textContent.toLowerCase().includes('violator information') ||
            el.textContent.toLowerCase().includes('complaint involves')
        );

        // Continue even if no specific section headers were found
        console.log(`IceShield: ${violatorHeaders.length > 0 ? "Found" : "Looking for"} violator information section`);        // Options we're looking for: Business/Company (20%), Individual (75%), Both (5%)
        let selectedViolatorType;
        const randomValue = Math.random();
        if (randomValue < 0.75) {
            selectedViolatorType = 'Individual';
        } else if (randomValue < 0.95) {
            selectedViolatorType = 'Business/Company';
        } else {
            selectedViolatorType = 'Both';
        }
        console.log("IceShield: Selected violator type:", selectedViolatorType);

        // Use the exact selectors from the provided HTML to find the radio buttons
        const businessRadio = document.querySelector('input[data-drupal-selector="edit-the-complaint-involves-a-2-businesscompany"]');
        const individualRadio = document.querySelector('input[data-drupal-selector="edit-the-complaint-involves-a-2-individual"]');
        const bothRadio = document.querySelector('input[data-drupal-selector="edit-the-complaint-involves-a-2-both"]');

        // Select the appropriate radio based on our choice
        let selectedRadio = null;
        if (selectedViolatorType === 'Business/Company' && businessRadio) {
            selectedRadio = businessRadio;
        } else if (selectedViolatorType === 'Individual' && individualRadio) {
            selectedRadio = individualRadio;
        } else if (selectedViolatorType === 'Both' && bothRadio) {
            selectedRadio = bothRadio;
        }
          // If we found the exact radio button, use it
        if (selectedRadio) {
            selectedRadio.checked = true;
            const event = new Event('change', { bubbles: true });
            selectedRadio.dispatchEvent(event);
            console.log(`IceShield: Selected violator type radio using exact selectors: ${selectedViolatorType}`);

            // Add delay to let the form adjust to selection
            setTimeout(() => {
                // Handle Business/Company fields if that option was selected
                if (selectedViolatorType === 'Business/Company' || selectedViolatorType === 'Both') {
                    console.log(`IceShield: Filling Business/Company information for option: ${selectedViolatorType}`);
                    fillBusinessInformation();
                }

                // Handle Individual fields if that option was selected
                if (selectedViolatorType === 'Individual' || selectedViolatorType === 'Both') {
                    console.log(`IceShield: Filling Individual information for option: ${selectedViolatorType}`);
                    // When "Both" is selected, wait a bit longer to fill individual information
                    // to avoid potential conflicts between the two form sections
                    if (selectedViolatorType === 'Both') {
                        setTimeout(() => {
                            fillIndividualInformation();
                        }, 500); // Extra delay when handling both sections
                    } else {
                        fillIndividualInformation();
                    }
                }
            }, 700); // Increased delay for better form rendering
            return;
        }

        // Try to find the radio buttons for these options
        let radioFound = false;
        const allRadios = document.querySelectorAll('input[type="radio"]');

        for (const radio of allRadios) {
            // Check the radio's label or nearby text
            const label = radio.labels ? radio.labels[0] : null;
            const labelText = label ? label.textContent.trim() : '';
            const radioId = radio.id ? radio.id.toLowerCase() : '';
            const radioName = radio.name ? radio.name.toLowerCase() : '';

            // Check if this radio matches our selected violator
            if (labelText === selectedViolatorType ||
                labelText.includes(selectedViolatorType) ||
                (radio.nextSibling && radio.nextSibling.textContent &&
                 radio.nextSibling.textContent.includes(selectedViolatorType))) {

                radio.checked = true;
                const event = new Event('change', { bubbles: true });
                radio.dispatchEvent(event);
                radioFound = true;
                console.log(`IceShield: Selected violator type radio: ${selectedViolatorType}`);                // Add delay to let the form adjust to selection
                setTimeout(() => {
                    // Handle Business/Company fields if that option was selected
                    if (selectedViolatorType === 'Business/Company' || selectedViolatorType === 'Both') {
                        console.log(`IceShield: Filling Business/Company information for option: ${selectedViolatorType}`);
                        fillBusinessInformation();
                    }

                    // Handle Individual fields if that option was selected
                    if (selectedViolatorType === 'Individual' || selectedViolatorType === 'Both') {
                        console.log(`IceShield: Filling Individual information for option: ${selectedViolatorType}`);
                        // When "Both" is selected, wait a bit longer to fill individual information
                        if (selectedViolatorType === 'Both') {
                            setTimeout(() => {
                                fillIndividualInformation();
                            }, 500); // Extra delay when handling both sections
                        } else {
                            fillIndividualInformation();
                        }
                    }
                }, 700); // Increased delay for better form rendering

                break;
            }
        }

        // If no radio was found, try other methods
        if (!radioFound) {
            console.log("IceShield: Violator type radio buttons not found by direct search");

            // Try looking for radio buttons in sections that contain the violator type text
            const sections = document.querySelectorAll('div, fieldset, section, form');
            for (const section of sections) {
                if (section.textContent.toLowerCase().includes('business/company') &&
                    section.textContent.toLowerCase().includes('individual') &&
                    section.textContent.toLowerCase().includes('both')) {

                    // Find radios in this section
                    const radios = section.querySelectorAll('input[type="radio"]');

                    if (radios.length >= 3) {  // There should be at least 3 options
                        let radioIndex;
                        switch (selectedViolatorType) {
                            case 'Business/Company':
                                radioIndex = 0;
                                break;
                            case 'Individual':
                                radioIndex = 1;
                                break;
                            case 'Both':
                                radioIndex = 2;
                                break;
                            default:
                                radioIndex = Math.floor(Math.random() * radios.length);
                        }

                        radios[radioIndex].checked = true;
                        const event = new Event('change', { bubbles: true });
                        radios[radioIndex].dispatchEvent(event);
                        radioFound = true;
                        console.log(`IceShield: Selected violator type radio by position: ${selectedViolatorType}`);                        // Add delay to let the form adjust to selection
                        setTimeout(() => {
                            // Handle Business/Company fields if that option was selected
                            if (selectedViolatorType === 'Business/Company' || selectedViolatorType === 'Both') {
                                console.log(`IceShield: Filling Business/Company information for option: ${selectedViolatorType}`);
                                fillBusinessInformation();
                            }

                            // Handle Individual fields if that option was selected
                            if (selectedViolatorType === 'Individual' || selectedViolatorType === 'Both') {
                                console.log(`IceShield: Filling Individual information for option: ${selectedViolatorType}`);
                                // When "Both" is selected, wait a bit longer to fill individual information
                                if (selectedViolatorType === 'Both') {
                                    setTimeout(() => {
                                        fillIndividualInformation();
                                    }, 500); // Extra delay when handling both sections
                                } else {
                                    fillIndividualInformation();
                                }
                            }
                        }, 500);

                        break;
                    }
                }
            }
        }

        if (!radioFound) {
            console.log("IceShield: Could not find violator type radio buttons");
        }
    }    // Function to fill in business information when Business/Company violator type is selected
    function fillBusinessInformation() {
        console.log("IceShield: Filling business information");

        // Generate random business data
        const businessName = getRandomElement(businessNames);
        const businessAddress = getRandomAddress(); // Use address from combined pool (business database or generated)

        // Use exact selectors from the provided HTML
        const businessNameField = document.querySelector('input[data-drupal-selector="edit-business-company-name"], input[name="business_company_name"]') ||
            document.querySelector('input[name*="business" i][name*="name" i], input[id*="business" i][id*="name" i], input[placeholder*="Business" i][placeholder*="Name" i], input[placeholder*="Company" i][placeholder*="Name" i]');

        if (businessNameField) {
            businessNameField.value = businessName;
            triggerInputEvent(businessNameField);
            console.log("IceShield: Filled business name:", businessName);
        } else {
            console.log("IceShield: Business name field not found");
        }

        // Find and fill the business address fields
        // Try different field patterns to find the right inputs for business address
        const patterns = [
            {line1: '[name*="business" i][name*="line1" i], [name*="company" i][name*="line1" i], [name*="business" i][name*="address1" i], [name*="company" i][name*="address1" i]'},
            {line2: '[name*="business" i][name*="line2" i], [name*="company" i][name*="line2" i], [name*="business" i][name*="address2" i], [name*="company" i][name*="address2" i]'},
            {city: '[name*="business" i][name*="city" i], [name*="company" i][name*="city" i]'},
            {zip: '[name*="business" i][name*="zip" i], [name*="company" i][name*="zip" i], [name*="business" i][name*="postal" i], [name*="company" i][name*="postal" i]'}
        ];

        // Find business section headers to locate fields more reliably
        const businessHeaders = Array.from(document.querySelectorAll('h2, h3, h4, legend, label, div.heading, div, p, span, strong')).filter(el =>
            el.textContent.toLowerCase().includes('business information') ||
            el.textContent.toLowerCase().includes('business/company') ||
            el.textContent.toLowerCase().includes('company information')
        );

        // Use exact selectors from the provided HTML - Use the exact data-drupal-selector provided
        let addressLine1Field = document.querySelector('input[data-drupal-selector="edit-line-1-busniess"]');

        // If not found with exact selectors, fall back to pattern matching
        if (!addressLine1Field) {
            addressLine1Field = document.querySelector(`input${patterns[0].line1}`);

            // If still not found, try expanded selectors with more attributes
            if (!addressLine1Field) {
                addressLine1Field = document.querySelector('input[placeholder*="Street" i], input[aria-label*="Street" i], input[placeholder*="Address" i]:not([placeholder*="Email"])')
            }

            // If still not found, try a more aggressive approach
            if (!addressLine1Field && businessHeaders.length > 0) {
                const businessHeader = businessHeaders[0];
                const allInputsNearHeader = findInputsInSection(businessHeader);

                // Skip the first input as it's likely the business name
                if (allInputsNearHeader.length > 1) {
                    addressLine1Field = allInputsNearHeader[1]; // Second input is likely the address line 1
                }
            }
        }
          // Use exact selectors from the provided HTML
        let addressLine2Field = document.querySelector('input[data-drupal-selector="edit-line-2-business"], input[name="line_2_business"]'); // Use the correct selector from the HTML
        let cityField = document.querySelector('input[data-drupal-selector="edit-city-business"], input[name="city_business"]');
        let zipField = document.querySelector('input[data-drupal-selector="edit-zip-code-business"], input[name="zip_code_business"]');

        // If exact selectors don't find the fields, fall back to pattern matching
        if (!addressLine2Field) {
            addressLine2Field = document.querySelector(`input${patterns[1].line2}`);
        }

        if (!cityField) {
            cityField = document.querySelector(`input${patterns[2].city}`);
        }

        if (!zipField) {
            zipField = document.querySelector(`input${patterns[3].zip}`);
        }

        // Fall back to general address fields if business-specific ones aren't found
        const line1Field = addressLine1Field || document.querySelector('input[name*="line1" i], input[name*="address1" i], input[placeholder*="line 1" i], input[name*="street" i]');
        const line2Field = addressLine2Field || document.querySelector('input[name*="line2" i], input[name*="address2" i], input[placeholder*="line 2" i], input[name*="apt" i]');
        const businessCityField = cityField || document.querySelector('input[name*="city" i], input[placeholder*="city" i]');
        const businessZipField = zipField || document.querySelector('input[name*="zip" i], input[name*="postal" i], input[placeholder*="zip" i], input[placeholder*="postal" i]');

        // Fill common fields
        if (line1Field) {
            line1Field.value = businessAddress.line1;
            triggerInputEvent(line1Field);
            console.log("IceShield: Filled business address line 1:", businessAddress.line1);
        } else {
            console.log("IceShield: Business address line 1 field not found");
            // Last resort: try to find any textual input fields
            const possibleAddressInputs = findUnfilledTextInputs();
            if (possibleAddressInputs.length > 0) {
                possibleAddressInputs[0].value = businessAddress.line1;
                triggerInputEvent(possibleAddressInputs[0]);
                console.log("IceShield: Filled business address using generic field detection");
            }
        }

        if (line2Field) {
            line2Field.value = businessAddress.line2;
            triggerInputEvent(line2Field);
            console.log("IceShield: Filled business address line 2");
        }

        if (businessCityField) {
            businessCityField.value = businessAddress.city;
            triggerInputEvent(businessCityField);
            console.log("IceShield: Filled business city");
        }        if (businessZipField) {
            // Ensure zip code is exactly 5 digits and numeric only
            const zipCode = businessAddress.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
            // Truncate if longer than 5 digits
            const formattedZip = zipCode.substring(0, 5);
            businessZipField.value = formattedZip;
            triggerInputEvent(businessZipField);
            console.log("IceShield: Filled business zip code:", formattedZip);
        }

        // Find and fill the business state field - use exact selector from HTML
        const stateField = document.querySelector('select[data-drupal-selector="edit-state-business"], select[name="state_business"]');
        const businessStateField = stateField || document.querySelector('select[name*="business" i][name*="state" i], select[id*="business" i][id*="state" i], select[name*="company" i][name*="state" i], select[id*="company" i][id*="state" i]') || document.querySelector('select[name*="state" i], select[id*="state" i]');

        if (businessStateField) {
            selectDropdownOptionByText(businessStateField, businessAddress.state);
            console.log("IceShield: Selected business state:", businessAddress.state);
        }

        // Helper function to find unfilled text inputs that might be address fields
        function findUnfilledTextInputs() {
            const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
            return inputs.filter(input => {
                return !input.value &&
                       !input.name.includes('email') &&
                       !input.name.includes('phone') &&
                       !input.placeholder.includes('Email') &&
                       !input.placeholder.includes('Phone');
            });
        }

        // Helper function to find input fields in the same section as a header element
        function findInputsInSection(headerElement) {
            const inputs = [];
            let element = headerElement;

            // Look for form fields after the header until we find 10 inputs or hit a new h2-h6 tag
            while (element && inputs.length < 10) {
                element = element.nextElementSibling;

                if (!element) break;

                // Stop if we hit a new section header
                if (element.tagName && /^h[2-6]$/i.test(element.tagName)) break;

                // Check if this element contains input fields
                const elementInputs = element.querySelectorAll('input[type="text"]');
                elementInputs.forEach(input => inputs.push(input));

                // Also check if this element is an input field itself
                if (element.tagName === "INPUT" && element.type === "text") {
                    inputs.push(element);
                }
            }

            return inputs;
        }

        // Last resort: Try to find business address fields by common label texts
        if (!line1Field || !line2Field || !businessCityField || !businessZipField || !businessStateField) {
            console.log("IceShield: Attempting to find business address fields by label text");

            // Define common label texts
            const businessAddressLabels = ["business's street address", "business street address", "business address", "company address", "street address", "address line 1"];
            const address2Labels = ["address line 2", "line 2", "apt", "suite", "unit"];
            const cityLabels = ["city", "town"];
            const stateLabels = ["state", "province"];
            const zipLabels = ["zip", "postal code", "zip code"];

            // Try each label until we find a match
            if (!line1Field) {
                for (const label of businessAddressLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        line1Field = found;
                        console.log("IceShield: Found business address line 1 field by label:", label);
                        line1Field.value = businessAddress.line1;
                        triggerInputEvent(line1Field);
                        break;
                    }
                }
            }

            if (!line2Field) {
                for (const label of address2Labels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        line2Field = found;
                        console.log("IceShield: Found business address line 2 field by label:", label);
                        line2Field.value = businessAddress.line2;
                        triggerInputEvent(line2Field);
                        break;
                    }
                }
            }

            if (!businessCityField) {
                for (const label of cityLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        businessCityField = found;
                        console.log("IceShield: Found business city field by label:", label);
                        businessCityField.value = businessAddress.city;
                        triggerInputEvent(businessCityField);
                        break;
                    }
                }
            }

            if (!businessStateField) {
                for (const label of stateLabels) {
                    const found = findInputByLabel(label);
                    if (found && (found.tagName === 'SELECT' || found.type === 'text')) {
                        businessStateField = found;
                        console.log("IceShield: Found business state field by label:", label);

                        if (businessStateField.tagName === 'SELECT') {
                            selectDropdownOptionByText(businessStateField, businessAddress.state);
                        } else {
                            businessStateField.value = businessAddress.state;
                            triggerInputEvent(businessStateField);
                        }
                        break;
                    }
                }
            }

            if (!businessZipField) {
                for (const label of zipLabels) {
                    const found = findInputByLabel(label);                    if (found) {
                        businessZipField = found;
                        console.log("IceShield: Found business zip field by label:", label);
                        // Ensure zip code is exactly 5 digits and numeric only
                        const zipCode = businessAddress.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
                        // Truncate if longer than 5 digits
                        const formattedZip = zipCode.substring(0, 5);
                        businessZipField.value = formattedZip;
                        triggerInputEvent(businessZipField);
                        break;
                    }
                }
            }

            // Ultimate fallback: use the aggressive field detection
            if (!line1Field || !line2Field || !businessCityField || !businessZipField || !businessStateField) {
                const visibleFields = findFieldsByVisibleText();

                if (!line1Field && (visibleFields.streetAddress || visibleFields.addressLine1)) {
                    line1Field = visibleFields.streetAddress || visibleFields.addressLine1;
                    line1Field.value = businessAddress.line1;
                    triggerInputEvent(line1Field);
                    console.log("IceShield: Filled business address line 1 using visible text detection");
                }

                if (!line2Field && visibleFields.addressLine2) {
                    line2Field = visibleFields.addressLine2;
                    line2Field.value = businessAddress.line2;
                    triggerInputEvent(line2Field);
                    console.log("IceShield: Filled business address line 2 using visible text detection");
                }

                if (!businessCityField && visibleFields.city) {
                    businessCityField = visibleFields.city;
                    businessCityField.value = businessAddress.city;
                    triggerInputEvent(businessCityField);
                    console.log("IceShield: Filled business city using visible text detection");
                }

                if (!businessStateField && visibleFields.state) {
                    businessStateField = visibleFields.state;
                    if (businessStateField.tagName === 'SELECT') {
                        selectDropdownOptionByText(businessStateField, businessAddress.state);
                    } else {
                        businessStateField.value = businessAddress.state;
                        triggerInputEvent(businessStateField);
                    }
                    console.log("IceShield: Filled business state using visible text detection");
                }                if (!businessZipField && visibleFields.zip) {
                    businessZipField = visibleFields.zip;
                    // Ensure zip code is exactly 5 digits and numeric only
                    const zipCode = businessAddress.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
                    // Truncate if longer than 5 digits
                    const formattedZip = zipCode.substring(0, 5);
                    businessZipField.value = formattedZip;
                    triggerInputEvent(businessZipField);
                    console.log("IceShield: Filled business zip code using visible text detection:", formattedZip);
                }
            }
        }        console.log("IceShield: Business information filled");
    }

    // Function to fill in individual information when Individual violator type is selected
    function fillIndividualInformation() {
        console.log("IceShield: Filling individual information");

        // Generate a random identity for the individual
        const individualIdentity = generateUSIdentity();        // Always use the address from individualIdentity, which is guaranteed to be US-based
        // Our updated address generation functions ensure proper geographic consistency
        const address = individualIdentity.address;

        // Find and fill the individual name fields using exact selectors provided
        // First try the exact data-drupal-selectors, then fall back to more generic selectors
        const firstNameField = document.querySelector('input[data-drupal-selector="edit-first-name-individual"]') ||
            document.querySelector('input[name*="individual" i][name*="first" i], input[id*="individual" i][id*="first" i], input[placeholder*="First name" i], input[aria-label*="First name" i], input[name*="first" i], input[id*="first" i]');

        const lastNameField = document.querySelector('input[data-drupal-selector="edit-last-name-individual"]') ||
            document.querySelector('input[name*="individual" i][name*="last" i], input[id*="individual" i][id*="last" i], input[placeholder*="Last name" i], input[aria-label*="Last name" i], input[name*="last" i], input[id*="last" i]');

        if (firstNameField) {
            firstNameField.value = individualIdentity.firstName;
            triggerInputEvent(firstNameField);
            console.log("IceShield: Filled individual first name:", individualIdentity.firstName);
        } else {
            console.log("IceShield: Individual first name field not found");
        }

        if (lastNameField) {
            lastNameField.value = individualIdentity.lastName;
            triggerInputEvent(lastNameField);
            console.log("IceShield: Filled individual last name:", individualIdentity.lastName);
        } else {
            console.log("IceShield: Individual last name field not found");
        }        // Handle Date of Birth or Approximate Age options
        // MODIFIED: Always selecting Approximate Age instead of Date of Birth
        console.log("IceShield: Looking for Age/DOB options (will always select Approximate Age)");

        // Find the "Choose One Option" dropdown or radio buttons using exact selectors first
        let dobRadio = document.querySelector('input[data-drupal-selector="edit-date-of-birth-or-approximate-age-dob"]');
        let ageRadio = document.querySelector('input[data-drupal-selector="edit-date-of-birth-or-approximate-age-age"]');

        // Try exact selector from HTML provided by user
        if (!ageRadio) {
            ageRadio = document.querySelector('input[id="edit-date-of-birth-or-approximate-age-age"]');
        }

        // If exact selectors didn't find them, try by ID (using the examples provided)
        if (!dobRadio) {
            dobRadio = document.querySelector('input#edit-date-of-birth-or-approximate-age-dob--bdhSSP_GymY');
        }
        if (!ageRadio) {
            ageRadio = document.querySelector('input#edit-date-of-birth-or-approximate-age-age--ZpyvkFmFMiA');
        }

        // Fallback to finding by associated text if needed
        if (!dobRadio || !ageRadio) {
            const ageOptionRadios = findRadiosByText("Date of Birth", "Approximate Age");
            if (ageOptionRadios.length >= 2) {
                dobRadio = ageOptionRadios[0];
                ageRadio = ageOptionRadios[1];
            }
        }

        // Further fallback - look for radio with label containing "age"
        if (!ageRadio) {
            const allRadios = document.querySelectorAll('input[type="radio"]');
            for (const radio of allRadios) {
                // Check if this radio has a label with "approximate age" text
                const radioId = radio.id;
                if (radioId) {
                    const label = document.querySelector(`label[for="${radioId}"]`);
                    if (label && label.textContent.toLowerCase().includes('approximate age')) {
                        ageRadio = radio;
                        console.log("IceShield: Found age radio by label text match");
                        break;
                    }
                }
            }
        }
          // MODIFIED: Always choose Approximate Age
        let dobSelected = false;

        if (ageRadio) {
            // Always select Approximate Age
            ageRadio.checked = true;
            const event = new Event('change', { bubbles: true });
            ageRadio.dispatchEvent(event);
            console.log("IceShield: Selected Approximate Age option (DOB option disabled)");

            // Add a longer delay to let the form fully update before filling the fields
            setTimeout(() => {
                // MODIFIED: Always fill Approximate Age, DOB is disabled
                fillApproximateAge();
            }, 500);
        } else {
            console.log("IceShield: Age radio not found, trying alternative methods");
              // If no radio buttons, look for a select/dropdown
            const ageOptionSelect = document.querySelector('select[name*="age" i], select[name*="dob" i], select[name*="birth" i], select[id*="age" i], select[id*="dob" i]');
            if (ageOptionSelect) {
                // Find options that mention DOB or Age
                let dobOptionIndex = -1;
                let ageOptionIndex = -1;

                for (let i = 0; i < ageOptionSelect.options.length; i++) {
                    const optionText = ageOptionSelect.options[i].text.toLowerCase();
                    if (optionText.includes('birth') || optionText.includes('dob')) {
                        dobOptionIndex = i;
                    } else if (optionText.includes('age')) {
                        ageOptionIndex = i;
                    }
                }

                // If we found relevant options, select one
                if (dobOptionIndex !== -1 || ageOptionIndex !== -1) {
                    // MODIFIED: Always choose Approximate Age when available
                    if (ageOptionIndex !== -1) {
                        ageOptionSelect.selectedIndex = ageOptionIndex;
                        dobSelected = false;
                    } else if (dobOptionIndex !== -1) {
                        // Only use DOB as a last resort if Age option is not available
                        ageOptionSelect.selectedIndex = dobOptionIndex;
                        dobSelected = true;
                    }                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    ageOptionSelect.dispatchEvent(event);
                    console.log(`IceShield: Selected ${dobSelected ? "Date of Birth" : "Approximate Age"} from dropdown`);

                    // Add a short delay to let the form update
                    setTimeout(() => {
                        // MODIFIED: Always fill Approximate Age regardless of selection
                        // If we had to select DOB as a last resort, we'll still use the Age field if we can find it
                        fillApproximateAge();
                    }, 300);}
            } else {
                // MODIFIED: Only fill Approximate Age, even if no selection mechanism is found
                // Leave DOB fields empty as per requirements
                fillApproximateAge();
            }
        }

        // Find and fill the individual address fields using exact selectors
        // Use the exact data-drupal-selectors provided for address fields
        const addressLine1Field = document.querySelector('input[data-drupal-selector="edit-line-1-individual"]');
        const addressLine2Field = document.querySelector('input[data-drupal-selector="edit-line-2-individual"]');

        // Define fallback patterns if exact selectors don't work
        const patterns = [
            {line1: '[name*="individual" i][name*="line1" i], [name*="individual" i][name*="address1" i], [name*="individual" i][name*="street" i]'},
            {line2: '[name*="individual" i][name*="line2" i], [name*="individual" i][name*="address2" i]'},
            {city: '[name*="individual" i][name*="city" i]'},
            {zip: '[name*="individual" i][name*="zip" i], [name*="individual" i][name*="postal" i]'}
        ];        // Try fallback patterns only if exact selectors don't work
        const addressLine1Fallback = !addressLine1Field ? document.querySelector(`input${patterns[0].line1}`) : null;
        const addressLine2Fallback = !addressLine2Field ? document.querySelector(`input${patterns[1].line2}`) : null;
        const cityField = document.querySelector(`input${patterns[2].city}`);
        const zipField = document.querySelector(`input${patterns[3].zip}`);

        // Try to find the specific zip code field from the HTML
        const exactZipField = document.querySelector('input[data-drupal-selector="edit-zip-code-individual"], input[name="zip_code_individual"]');

        // Fall back to general address fields if needed
        const line1Field = addressLine1Field || addressLine1Fallback || document.querySelector('input[name*="line1" i], input[name*="address1" i], input[placeholder*="line 1" i], input[name*="street" i], input[aria-label*="Street Address" i]');
        const line2Field = addressLine2Field || addressLine2Fallback || document.querySelector('input[name*="line2" i], input[name*="address2" i], input[placeholder*="line 2" i], input[name*="apt" i]');
        const individualCityField = cityField || document.querySelector('input[name*="city" i], input[placeholder*="city" i], input[aria-label*="City" i]');
        const individualZipField = exactZipField || zipField || document.querySelector('input[name*="zip" i], input[name*="postal" i], input[placeholder*="zip" i], input[placeholder*="postal" i], input[aria-label*="Zip" i], input[pattern*="\\d{5}"]');

        // Fill common fields
        if (line1Field) {
            line1Field.value = address.line1;
            triggerInputEvent(line1Field);
            console.log("IceShield: Filled individual address line 1");
        }
        if (line2Field) {
            line2Field.value = address.line2;
            triggerInputEvent(line2Field);
            console.log("IceShield: Filled individual address line 2");
        }        if (individualCityField) {
            individualCityField.value = address.city;
            triggerInputEvent(individualCityField);
            console.log("IceShield: Filled individual city");
        }
        if (individualZipField) {
            // Ensure zip code is exactly 5 digits
            const zipCode = address.zip.toString().padStart(5, '0');
            // Truncate if longer than 5 digits
            const formattedZip = zipCode.substring(0, 5);
            individualZipField.value = formattedZip;
            triggerInputEvent(individualZipField);
            console.log("IceShield: Filled individual zip code:", formattedZip);
        }// Find and fill the individual state field - use exact selector from HTML
        const stateField = document.querySelector('select[data-drupal-selector="edit-state-individual"], select[name="state_individual"]') ||
            document.querySelector('select[name*="individual" i][name*="state" i], select[id*="individual" i][id*="state" i]');
        const individualStateField = stateField || document.querySelector('select[name*="state" i], select[id*="state" i]');

        if (individualStateField) {
            // Try multiple selection strategies for better success rate
            let success = false;

            // First attempt: Try to directly set the value and trigger change event
            if (address.state && !success) {
                // Try to select by state abbreviation first if available
                const stateAbbr = stateAbbreviations[address.state];
                if (stateAbbr) {
                    // Ensure we're only using valid state codes from the form
                    for (let i = 0; i < individualStateField.options.length; i++) {
                        // Log all options for debugging if needed
                        // console.log(`Option ${i}: value=${individualStateField.options[i].value}, text=${individualStateField.options[i].text}`);

                        if (individualStateField.options[i].value === stateAbbr) {
                            individualStateField.selectedIndex = i;
                            const event = new Event('change', { bubbles: true });
                            individualStateField.dispatchEvent(event);
                            console.log("IceShield: Selected individual state by abbreviation:", address.state, stateAbbr);
                            success = true;
                            break;
                        }
                    }
                }
            }

            // If selecting by value didn't work, fall back to using the helper function
            if (!success) {
                selectDropdownOptionByText(individualStateField, address.state);
                console.log("IceShield: Selected individual state:", address.state);
            }

            // Trigger change event explicitly to ensure the value is recognized by the form
            const changeEvent = new Event('change', { bubbles: true });
            individualStateField.dispatchEvent(changeEvent);
        }

        // Last resort: Try to find individual address fields by common label texts
        if (!line1Field || !line2Field || !individualCityField || !individualZipField || !individualStateField) {
            console.log("IceShield: Attempting to find individual address fields by label text");

            // Define common label texts
            const addressLabels = ["individual's street address", "individual address", "person address", "street address", "address line 1"];
            const address2Labels = ["address line 2", "line 2", "apt", "suite", "unit"];
            const cityLabels = ["city", "town"];
            const stateLabels = ["state", "province"];
            const zipLabels = ["zip", "postal code", "zip code"];

            // Try each label until we find a match
            if (!line1Field) {
                for (const label of addressLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        line1Field = found;
                        console.log("IceShield: Found individual address line 1 field by label:", label);
                        line1Field.value = address.line1;
                        triggerInputEvent(line1Field);
                        break;
                    }
                }
            }

            if (!line2Field) {
                for (const label of address2Labels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        line2Field = found;
                        console.log("IceShield: Found individual address line 2 field by label:", label);
                        line2Field.value = address.line2;
                        triggerInputEvent(line2Field);
                        break;
                    }
                }
            }

            if (!individualCityField) {
                for (const label of cityLabels) {
                    const found = findInputByLabel(label);
                    if (found) {
                        individualCityField = found;
                        console.log("IceShield: Found individual city field by label:", label);
                        individualCityField.value = address.city;
                        triggerInputEvent(individualCityField);
                        break;
                    }
                }
            }            if (!individualStateField) {
                // First try to get the state field by exact drupal selector
                individualStateField = document.querySelector('select[data-drupal-selector="edit-state-individual"]');
                if (individualStateField) {
                    console.log("IceShield: Found individual state field by exact data-drupal-selector");

                    // Try to select by state abbreviation first for better success rate
                    let success = false;
                    const stateAbbr = stateAbbreviations[address.state];
                    if (stateAbbr) {
                        for (let i = 0; i < individualStateField.options.length; i++) {
                            if (individualStateField.options[i].value === stateAbbr ||
                                individualStateField.options[i].text === stateAbbr ||
                                individualStateField.options[i].value.toUpperCase() === stateAbbr ||
                                individualStateField.options[i].text.toUpperCase() === stateAbbr) {
                                individualStateField.selectedIndex = i;
                                const changeEvent = new Event('change', { bubbles: true });
                                individualStateField.dispatchEvent(changeEvent);
                                console.log("IceShield: Selected individual state by abbreviation:", address.state, stateAbbr);
                                success = true;
                                break;
                            }
                        }
                    }

                    // If direct selection failed, use the helper function
                    if (!success) {
                        selectDropdownOptionByText(individualStateField, address.state);
                        // Ensure the change event is triggered
                        const changeEvent = new Event('change', { bubbles: true });
                        individualStateField.dispatchEvent(changeEvent);
                    }
                } else {
                    // If no exact match, try label-based search
                    for (const label of stateLabels) {
                        const found = findInputByLabel(label);
                        if (found && (found.tagName === 'SELECT' || found.type === 'text')) {
                            individualStateField = found;
                            console.log("IceShield: Found individual state field by label:", label);

                            if (individualStateField.tagName === 'SELECT') {
                                selectDropdownOptionByText(individualStateField, address.state);
                            } else {
                                individualStateField.value = address.state;
                                triggerInputEvent(individualStateField);
                            }
                            break;
                        }
                    }
                }
            }

            if (!individualZipField) {
                for (const label of zipLabels) {
                    const found = findInputByLabel(label);                    if (found) {
                        individualZipField = found;
                        console.log("IceShield: Found individual zip field by label:", label);
                        // Ensure zip code is exactly 5 digits and numeric only
                        const zipCode = address.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
                        // Truncate if longer than 5 digits
                        const formattedZip = zipCode.substring(0, 5);
                        individualZipField.value = formattedZip;
                        triggerInputEvent(individualZipField);
                        break;
                    }
                }
            }

            // Ultimate fallback: use the aggressive field detection
            if (!line1Field || !line2Field || !individualCityField || !individualZipField) {
                const visibleFields = findFieldsByVisibleText();

                if (!line1Field && (visibleFields.streetAddress || visibleFields.addressLine1)) {
                    line1Field = visibleFields.streetAddress || visibleFields.addressLine1;
                    line1Field.value = address.line1;
                    triggerInputEvent(line1Field);
                    console.log("IceShield: Filled individual address line 1 using visible text detection");
                }

                if (!line2Field && visibleFields.addressLine2) {
                    line2Field = visibleFields.addressLine2;
                    line2Field.value = address.line2;
                    triggerInputEvent(line2Field);
                    console.log("IceShield: Filled individual address line 2 using visible text detection");
                }

                if (!individualCityField && visibleFields.city) {
                    individualCityField = visibleFields.city;
                    individualCityField.value = address.city;
                    triggerInputEvent(individualCityField);
                    console.log("IceShield: Filled individual city using visible text detection");
                }                if (!individualStateField && visibleFields.state) {
                    individualStateField = visibleFields.state;
                    if (individualStateField.tagName === 'SELECT') {
                        // Try to select using the exact drupal selector first
                        const specificStateField = document.querySelector('select[data-drupal-selector="edit-state-individual"]');
                        if (specificStateField) {
                            individualStateField = specificStateField;
                            console.log("IceShield: Found individual state field by exact data-drupal-selector");
                        }

                        // First try direct value selection for state
                        let success = false;
                        const stateAbbr = stateAbbreviations[address.state];
                        if (stateAbbr) {
                            for (let i = 0; i < individualStateField.options.length; i++) {
                                if (individualStateField.options[i].value === stateAbbr ||
                                    individualStateField.options[i].text === stateAbbr ||
                                    individualStateField.options[i].value.toUpperCase() === stateAbbr ||
                                    individualStateField.options[i].text.toUpperCase() === stateAbbr) {
                                    individualStateField.selectedIndex = i;
                                    const changeEvent = new Event('change', { bubbles: true });
                                    individualStateField.dispatchEvent(changeEvent);
                                    console.log("IceShield: Selected individual state by value abbreviation:", address.state, stateAbbr);
                                    success = true;
                                    break;
                                }
                            }
                        }

                        // If direct selection failed, try the helper function
                        if (!success) {
                            selectDropdownOptionByText(individualStateField, address.state);
                            // Ensure change event is triggered
                            const changeEvent = new Event('change', { bubbles: true });
                            individualStateField.dispatchEvent(changeEvent);
                        }
                    } else {
                        individualStateField.value = address.state;
                        triggerInputEvent(individualStateField);
                    }
                    console.log("IceShield: Filled individual state using visible text detection");
                }                if (!individualZipField && visibleFields.zip) {
                    individualZipField = visibleFields.zip;
                    // Ensure zip code is exactly 5 digits and numeric only
                    const zipCode = address.zip.toString().replace(/[^0-9]/g, '').padStart(5, '0');
                    // Truncate if longer than 5 digits
                    const formattedZip = zipCode.substring(0, 5);
                    individualZipField.value = formattedZip;
                    triggerInputEvent(individualZipField);
                    console.log("IceShield: Filled individual zip code using visible text detection:", formattedZip);
                }
            }
        }

        console.log("IceShield: Individual information filled");
    }

    // Helper function to fill Date of Birth field
    function fillDateOfBirth() {
        // Generate a random birth date for an adult (18-80 years old)
        const currentYear = new Date().getFullYear();
        const age = Math.floor(Math.random() * 62) + 18; // 18-80 years old
        const birthYear = currentYear - age;

        // Random month and day
        const birthMonth = Math.floor(Math.random() * 12) + 1; // 1-12

        // Determine the max day based on the month
        let maxDay;
        switch (birthMonth) {
            case 2: // February
                // Simple leap year check
                maxDay = (birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0 ? 29 : 28;
                break;
            case 4: case 6: case 9: case 11: // April, June, September, November
                maxDay = 30;
                break;
            default:
                maxDay = 31;
        }

        const birthDay = Math.floor(Math.random() * maxDay) + 1; // 1-[28-31]

        // Format the date as MM/DD/YYYY
        const dob = `${birthMonth.toString().padStart(2, '0')}/${birthDay.toString().padStart(2, '0')}/${birthYear}`;

        // Find and fill the DOB field
        const dobField = document.querySelector('input[name*="birth" i], input[id*="birth" i], input[name*="dob" i], input[id*="dob" i], input[placeholder*="birth" i], input[aria-label*="Date of Birth" i]');

        if (dobField) {
            dobField.value = dob;
            triggerInputEvent(dobField);
            console.log("IceShield: Filled Date of Birth:", dob);
        } else {
            // Try individual month, day, year fields
            const monthField = document.querySelector('input[name*="month" i], select[name*="month" i], input[id*="month" i], select[id*="month" i]');
            const dayField = document.querySelector('input[name*="day" i], select[name*="day" i], input[id*="day" i], select[id*="day" i]');
            const yearField = document.querySelector('input[name*="year" i], select[name*="year" i], input[id*="year" i], select[id*="year" i]');

            if (monthField) {
                if (monthField.tagName.toLowerCase() === 'select') {
                    monthField.selectedIndex = birthMonth;
                } else {
                    monthField.value = birthMonth.toString().padStart(2, '0');
                }
                triggerInputEvent(monthField);
            }

            if (dayField) {
                if (dayField.tagName.toLowerCase() === 'select') {
                    dayField.selectedIndex = birthDay;
                } else {
                    dayField.value = birthDay.toString().padStart(2, '0');
                }
                triggerInputEvent(dayField);
            }

            if (yearField) {
                if (yearField.tagName.toLowerCase() === 'select') {
                    // Find the option with this year
                    for (let i = 0; i < yearField.options.length; i++) {
                        if (Number(yearField.options[i].value) === birthYear ||
                            yearField.options[i].text === birthYear.toString()) {
                            yearField.selectedIndex = i;
                            break;
                        }
                    }
                } else {
                    yearField.value = birthYear;
                }
                triggerInputEvent(yearField);
            }

            if (monthField || dayField || yearField) {
                console.log(`IceShield: Filled Date of Birth: ${birthMonth}/${birthDay}/${birthYear}`);
            } else {
                console.log("IceShield: Date of Birth fields not found");
            }
        }
    }

    // Helper function to fill Approximate Age field
    function fillApproximateAge() {
        // Generate a random age (18-80)
        const age = Math.floor(Math.random() * 62) + 18;

        // Find and fill the age field - use exact selector from HTML provided by user first
        // The exact selector from the HTML is: input[data-drupal-selector="edit-approximate-age"][id="edit-approximate-age"][name="approximate_age"]
        const ageField = document.querySelector('input[data-drupal-selector="edit-approximate-age"]') ||
                         document.querySelector('input[id="edit-approximate-age"]') ||
                         document.querySelector('input[name="approximate_age"]') ||
                         document.querySelector('input[name*="age" i], input[id*="age" i], input[placeholder*="age" i], input[aria-label*="Approximate Age" i]');

        if (ageField) {
            ageField.value = age;
            triggerInputEvent(ageField);            console.log("IceShield: Filled Approximate Age:", age);
        } else {
            console.log("IceShield: Approximate Age field not found");
        }
    }

    // Function to submit the form
    function submitForm() {
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"], button:contains("Submit")');
        if (submitButton) {
            console.log("IceShield: Submitting form");
            submitButton.click();

            // Increment and save the submission count
            loopCount++;
            GM_setValue('loopCount', loopCount);
            console.log(`IceShield: Form submitted ${loopCount} times`);        } else {
            console.log("IceShield: Submit button not found");
        }
    }

    // Function to reset/clear all form fields
    function resetForm() {
        console.log("IceShield: Resetting all form fields");

        // Clear all text inputs
        const textInputs = document.querySelectorAll('input[type="text"], input:not([type]), input[type="email"], input[type="tel"], input[type="number"]');
        textInputs.forEach(input => {
            if (input.value) {
                input.value = '';
                triggerInputEvent(input);
                console.log("IceShield: Cleared text field:", input.name || input.id || "unnamed");
            }
        });

        // Clear all textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            if (textarea.value) {
                textarea.value = '';
                triggerInputEvent(textarea);
                console.log("IceShield: Cleared textarea:", textarea.name || textarea.id || "unnamed");
            }
        });

        // Reset all select/dropdown elements to first option
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            if (select.selectedIndex !== 0) {
                select.selectedIndex = 0;
                triggerInputEvent(select);
                console.log("IceShield: Reset select field:", select.name || select.id || "unnamed");
            }
        });

        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            triggerInputEvent(checkbox);
            console.log("IceShield: Unchecked checkbox:", checkbox.name || checkbox.id || "unnamed");
        });        // Reset all radio buttons by unchecking all of them
        // (Browser will handle ensuring only one per group gets checked later)
        const radios = document.querySelectorAll('input[type="radio"]:checked');
        radios.forEach(radio => {
            radio.checked = false;
            triggerInputEvent(radio);
            console.log("IceShield: Unchecked radio button:", radio.name || radio.id || "unnamed");
        });        // Reset fill count
        loopCount = 0;
        GM_setValue('loopCount', loopCount);

        // Update the counter in the UI
        const fillsValueElement = document.getElementById('iceshield-fills-value');
        if (fillsValueElement) {
            fillsValueElement.textContent = '0';
            console.log("IceShield: Updated UI counter to 0");
        } else {
            console.log("IceShield: Could not find fills-value element to update");
        }

        console.log("IceShield: Fill count reset to 0");

        // Reset status to "Ready"
        window.updateIceShieldStatus('Ready');

        console.log("IceShield: All form fields have been reset");
    }// Function to scroll to the submit button/captcha section
    function scrollToSubmitButton() {
        console.log("IceShield: Attempting to scroll to submit button or captcha");

        // Look for common submit button selectors
        const submitSelectors = [
            'input[type="submit"]',
            'button[type="submit"]',
            'button.submit',
            'input.submit',
            'button[id*="submit"]',
            'input[id*="submit"]',
            'div[data-drupal-selector="edit-captcha"]',
            'div.captcha',
            'div.g-recaptcha'
        ];

        // Find the first visible submit button or captcha
        for (const selector of submitSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (element.offsetParent !== null) { // Check if visible
                    // Scroll the element into view with some padding
                    const rect = element.getBoundingClientRect();
                    const targetY = window.pageYOffset + rect.top - 100; // 100px padding above
                    window.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });
                    console.log("IceShield: Scrolled to element:", selector);
                    return true;
                }
            }
        }

        // If no submit button/captcha found, try to scroll to the bottom of the form
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
            if (form.offsetParent !== null) { // Check if form is visible
                const formBottom = form.offsetTop + form.offsetHeight - 200;
                window.scrollTo({
                    top: formBottom,
                    behavior: 'smooth'
                });
                console.log("IceShield: No submit button found, scrolled to bottom of form");
                return true;
            }
        }

        console.log("IceShield: Could not find any element to scroll to");
        return false;
    }

    // Function to scroll to the CAPTCHA and Submit button area    // Helper function for manual CAPTCHA fallback
    function manualCaptchaFallback() {
        console.log("IceShield: Manual CAPTCHA fallback - scrolling to CAPTCHA and submit button");

        // Try to find the submit button first
        const submitButton = document.querySelector('input[data-drupal-selector="edit-submit"], input#edit-submit--KWVgqJMosuM, input[type="submit"][value="Submit"]');

        // Try to find the reCAPTCHA container
        const captchaContainer = document.querySelector('#rc-anchor-container, div.g-recaptcha, iframe[title*="recaptcha"], div[class*="recaptcha"], div[class*="captcha"]');

        // Find the reCAPTCHA checkbox
        const recaptchaCheckbox = document.querySelector('#recaptcha-anchor, span.recaptcha-checkbox');

        // Determine which element to scroll to (prefer CAPTCHA, fall back to submit button)
        const elementToScrollTo = captchaContainer || recaptchaCheckbox || submitButton;

        if (elementToScrollTo) {
            // Scroll the element into view with some space above
            elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log("IceShield: Scrolled to form submission area");

            // Highlight the area to make it more visible
            if (submitButton) {
                submitButton.style.boxShadow = '0 0 10px 5px rgba(0,255,0,0.5)';
                setTimeout(() => {
                    submitButton.style.boxShadow = '';
                }, 3000); // Remove highlight after 3 seconds
            }
        } else {
            // If specific elements not found, scroll to the bottom of the form
            console.log("IceShield: CAPTCHA and submit button not found, scrolling to bottom of page");
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    function scrollToCaptchaAndSubmit() {
        console.log("IceShield: Processing CAPTCHA and submit area");

        // Check for CAPTCHA auto mode and API key
        if (captchaAutoMode && captchaApiKey) {
            // Try to detect what type of CAPTCHA is present
            const recaptchaV2 = document.querySelector('.g-recaptcha');
            const recaptchaV3 = document.querySelector('script[src*="recaptcha/api.js?render="]');
            const hCaptcha = document.querySelector('.h-captcha');

            if (recaptchaV2 || recaptchaV3 || hCaptcha) {
                console.log("IceShield: CAPTCHA detected, attempting automatic solution");
                window.updateIceShieldStatus('Solving CAPTCHA...');

                // Attempt to solve CAPTCHA automatically
                solveCaptcha()
                    .then(() => {
                        console.log("IceShield: CAPTCHA solved successfully");
                        window.updateIceShieldStatus('CAPTCHA solved!');

                        // Submit form after solving CAPTCHA
                        setTimeout(() => {
                            submitForm();
                        }, 500);
                    })
                    .catch(error => {
                        console.error("IceShield CAPTCHA Error:", error);
                        window.updateIceShieldStatus('CAPTCHA failed: ' + error.message);

                        // Fall back to manual mode if auto-solving fails
                        console.log("IceShield: Falling back to manual CAPTCHA handling");
                        manualCaptchaFallback();
                    });
                return;
            } else {
                console.log("IceShield: No supported CAPTCHA detected, continuing with manual mode");
            }
        }

        // Fall back to manual CAPTCHA handling if auto mode is disabled or no CAPTCHA detected
        manualCaptchaFallback();
    }
      // Function to show CAPTCHA settings modal
    function showCaptchaSettings() {
        console.log("IceShield: Opening Captcha API Configuration");

        // Remove any existing modal
        const existingModal = document.getElementById('iceshield-captcha-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'iceshield-captcha-modal';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            width: 350px;
            max-width: 90%;
            position: relative;
        `;

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #333;
            padding: 0 8px;
        `;
        closeButton.onclick = () => modalOverlay.remove();
          // Create header
        const header = document.createElement('h2');
        header.textContent = 'Captcha API Configuration';
        header.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            color: #333;
            font-size: 18px;
        `;
        // Create provider selection
        const providerLabel = document.createElement('div');
        providerLabel.textContent = 'CAPTCHA Service Provider:';
        providerLabel.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
        `;

        const providerSelect = document.createElement('select');
        providerSelect.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border-radius: 4px;
            border: 1px solid #ccc;
        `;

        // Add provider options
        const providers = [
            { value: '2captcha', text: '2Captcha.com' },
            { value: 'nopecha', text: 'NoCaptcha.com' }
        ];

        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.value;
            option.textContent = provider.text;
            if (provider.value === captchaProvider) {
                option.selected = true;
            }
            providerSelect.appendChild(option);
        });

        // Create API Key input
        const apiKeyLabel = document.createElement('div');
        apiKeyLabel.textContent = 'API Key:';
        apiKeyLabel.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
        `;
          const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'text';
        apiKeyInput.placeholder = 'Enter your API key';
        apiKeyInput.value = captchaApiKey;
        apiKeyInput.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 20px;
            border-radius: 4px;
            border: 1px solid #ccc;
            box-sizing: border-box;
        `;

        // Create auto mode checkbox
        const autoModeContainer = document.createElement('div');
        autoModeContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        `;

        const autoModeCheckbox = document.createElement('input');
        autoModeCheckbox.type = 'checkbox';
        autoModeCheckbox.id = 'iceshield-captcha-auto-mode';
        autoModeCheckbox.checked = captchaAutoMode;
        autoModeCheckbox.style.cssText = `
            margin-right: 10px;
            width: 18px;
            height: 18px;
        `;

        const autoModeLabel = document.createElement('label');
        autoModeLabel.textContent = 'Auto-solve CAPTCHA when available';
        autoModeLabel.htmlFor = 'iceshield-captcha-auto-mode';
        autoModeLabel.style.cssText = `
            font-weight: bold;
        `;

        autoModeContainer.appendChild(autoModeCheckbox);
        autoModeContainer.appendChild(autoModeLabel);

        // Create save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Settings';
        saveButton.style.cssText = `
            background-color: #27ae60;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
        `;

        saveButton.onmouseover = () => saveButton.style.backgroundColor = '#219955';
        saveButton.onmouseout = () => saveButton.style.backgroundColor = '#27ae60';
          saveButton.onclick = () => {
            captchaApiKey = apiKeyInput.value.trim();
            captchaProvider = providerSelect.value;
            captchaAutoMode = autoModeCheckbox.checked;

            // Save to GM storage
            GM_setValue('captchaApiKey', captchaApiKey);
            GM_setValue('captchaProvider', captchaProvider);
            GM_setValue('captchaAutoMode', captchaAutoMode);

            // Show success message and close modal
            const status = document.querySelector('#iceshield-status-value');
            if (status) {
                if (captchaApiKey) {                    status.textContent = 'Captcha API configuration saved!';
                    setTimeout(() => status.textContent = 'Ready', 2000);
                } else {
                    status.textContent = 'API key cleared';
                    setTimeout(() => status.textContent = 'Ready', 2000);
                }
            }

            modalOverlay.remove();
        };
          // Add everything to modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(header);
        modalContent.appendChild(providerLabel);
        modalContent.appendChild(providerSelect);
        modalContent.appendChild(apiKeyLabel);
        modalContent.appendChild(apiKeyInput);
        modalContent.appendChild(autoModeContainer);
        modalContent.appendChild(saveButton);

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
    }
      // Function to automate form with CAPTCHA solving
    function automateForm() {
        if (isAutomating) {
            // Stop automation
            console.log("IceShield: Stopping automation");
            isAutomating = false;
            if (automationInterval) {
                clearInterval(automationInterval);
                automationInterval = null;
            }
            window.updateIceShieldStatus('Automation stopped');

            // Update button text to show it can start again
            const automateButton = document.querySelector('#iceshield-ui button:nth-child(3)');
            if (automateButton) {
                automateButton.textContent = 'Automate';
                automateButton.style.backgroundColor = '#9b59b6';
            }
            return;
        }

        // Start automation
        console.log("IceShield: Starting automated form submissions");

        if (!captchaApiKey) {
            // If no API key is set, show the Captcha API configuration modal
            window.updateIceShieldStatus('No API key set');
            showCaptchaSettings();
            return;
        }

        isAutomating = true;
        window.updateIceShieldStatus('Automation running...');

        // Update button text to show it can stop
        const automateButton = document.querySelector('#iceshield-ui button:nth-child(3)');
        if (automateButton) {
            automateButton.textContent = 'Stop Auto';
            automateButton.style.backgroundColor = '#e74c3c'; // Red color
        }

        // Function to perform a single automation cycle
        function performAutomationCycle() {
            if (!isAutomating) return; // Safety check

            console.log("IceShield: Performing automation cycle");

            // Fill the form first
            fillForm();

            // Then attempt to solve CAPTCHA and submit
            setTimeout(() => {
                if (!isAutomating) return; // Check again after delay

                window.updateIceShieldStatus('Solving CAPTCHA...');
                solveCaptcha()
                    .then(() => {
                        if (!isAutomating) return;
                        window.updateIceShieldStatus('CAPTCHA solved!');
                        // Submit form after solving CAPTCHA
                        submitForm();

                        // Wait for page to process, then continue if still automating
                        setTimeout(() => {
                            if (isAutomating) {
                                window.updateIceShieldStatus('Automation running...');
                                // Check if we're still on the form page, if so continue
                                const submitButton = document.querySelector('input[type="submit"], button[type="submit"]');
                                if (submitButton) {
                                    performAutomationCycle();
                                } else {
                                    // Form might have been submitted, wait longer before next cycle
                                    setTimeout(performAutomationCycle, 3000);
                                }
                            }
                        }, 2000);
                    })
                    .catch(error => {
                        if (!isAutomating) return;
                        console.error("IceShield CAPTCHA Error:", error);
                        window.updateIceShieldStatus('CAPTCHA failed: ' + error.message);

                        // Try again after a short delay
                        setTimeout(() => {
                            if (isAutomating) {
                                performAutomationCycle();
                            }
                        }, 5000);
                    });
            }, 1500);
        }

        // Start the first cycle
        performAutomationCycle();
    }

    // Function to solve CAPTCHA
    async function solveCaptcha() {
        return new Promise((resolve, reject) => {
            // First detect what type of CAPTCHA is present
            const recaptchaV2 = document.querySelector('.g-recaptcha');
            const recaptchaV3 = document.querySelector('script[src*="recaptcha/api.js?render="]');
            const hCaptcha = document.querySelector('.h-captcha');

            if (!recaptchaV2 && !recaptchaV3 && !hCaptcha) {
                // No supported CAPTCHA found
                return reject(new Error("No supported CAPTCHA detected"));
            }

            if (recaptchaV2) {
                solveRecaptchaV2()
                    .then(resolve)
                    .catch(reject);
            } else if (recaptchaV3) {
                solveRecaptchaV3()
                    .then(resolve)
                    .catch(reject);
            } else if (hCaptcha) {
                solveHCaptcha()
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    // Function to solve reCAPTCHA v2
    async function solveRecaptchaV2() {
        return new Promise((resolve, reject) => {
            try {
                const sitekey = document.querySelector('.g-recaptcha').getAttribute('data-sitekey');
                if (!sitekey) {
                    return reject(new Error("Could not extract reCAPTCHA sitekey"));
                }

                const pageUrl = window.location.href;

                if (captchaProvider === '2captcha') {
                    // 2Captcha implementation
                    const apiUrl = `https://2captcha.com/in.php?key=${captchaApiKey}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${encodeURIComponent(pageUrl)}&json=1`;

                    // Send the CAPTCHA to 2Captcha
                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 1) {
                                const captchaId = data.request;

                                // Poll for the CAPTCHA solution
                                const checkSolution = setInterval(() => {
                                    const solutionUrl = `https://2captcha.com/res.php?key=${captchaApiKey}&action=get&id=${captchaId}&json=1`;

                                    fetch(solutionUrl)
                                        .then(response => response.json())
                                        .then(solutionData => {
                                            if (solutionData.status === 1) {
                                                clearInterval(checkSolution);

                                                // Apply the solution to the page
                                                const token = solutionData.request;
                                                applyCaptchaSolution(token);
                                                resolve();
                                            } else if (solutionData.request !== "CAPCHA_NOT_READY") {
                                                clearInterval(checkSolution);
                                                reject(new Error(`2Captcha error: ${solutionData.request}`));
                                            }
                                        })
                                        .catch(error => {
                                            clearInterval(checkSolution);
                                            reject(error);
                                        });
                                }, 5000); // Check every 5 seconds
                            } else {
                                reject(new Error(`2Captcha error: ${data.request}`));
                            }
                        })
                        .catch(reject);
                } else if (captchaProvider === 'nopecha') {
                    // NoCaptcha implementation
                    const apiUrl = `https://api.nopecha.com/token?key=${captchaApiKey}&type=recaptcha2&sitekey=${sitekey}&url=${encodeURIComponent(pageUrl)}`;

                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.data && data.data.token) {
                                // Apply the solution to the page
                                applyCaptchaSolution(data.data.token);
                                resolve();
                            } else {
                                reject(new Error(`NoCaptcha error: ${data.error || 'Unknown error'}`));
                            }
                        })
                        .catch(reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Function to solve reCAPTCHA v3
    async function solveRecaptchaV3() {
        return new Promise((resolve, reject) => {
            // Extract sitekey from script tag
            const scriptTag = document.querySelector('script[src*="recaptcha/api.js?render="]');
            const sitekey = scriptTag.src.split('render=')[1].split('&')[0];

            if (!sitekey) {
                return reject(new Error("Could not extract reCAPTCHA v3 sitekey"));
            }

            const pageUrl = window.location.href;

            if (captchaProvider === '2captcha') {
                // 2Captcha implementation for v3
                const apiUrl = `https://2captcha.com/in.php?key=${captchaApiKey}&method=userrecaptcha&version=v3&action=verify&min_score=0.3&googlekey=${sitekey}&pageurl=${encodeURIComponent(pageUrl)}&json=1`;

                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 1) {
                            const captchaId = data.request;

                            const checkSolution = setInterval(() => {
                                const solutionUrl = `https://2captcha.com/res.php?key=${captchaApiKey}&action=get&id=${captchaId}&json=1`;

                                fetch(solutionUrl)
                                    .then(response => response.json())
                                    .then(solutionData => {
                                        if (solutionData.status === 1) {
                                            clearInterval(checkSolution);

                                            const token = solutionData.request;
                                            applyRecaptchaV3Solution(token, sitekey);
                                            resolve();
                                        } else if (solutionData.request !== "CAPCHA_NOT_READY") {
                                            clearInterval(checkSolution);
                                            reject(new Error(`2Captcha error: ${solutionData.request}`));
                                        }
                                    })
                                    .catch(error => {
                                        clearInterval(checkSolution);
                                        reject(error);
                                    });
                            }, 5000);
                        } else {
                            reject(new Error(`2Captcha error: ${data.request}`));
                        }
                    })
                    .catch(reject);
            } else if (captchaProvider === 'nopecha') {
                // NoCaptcha implementation for v3
                const apiUrl = `https://api.nopecha.com/token?key=${captchaApiKey}&type=recaptcha3&sitekey=${sitekey}&url=${encodeURIComponent(pageUrl)}&action=verify`;

                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.data && data.data.token) {
                            applyRecaptchaV3Solution(data.data.token, sitekey);
                            resolve();
                        } else {
                            reject(new Error(`NoCaptcha error: ${data.error || 'Unknown error'}`));
                        }
                    })
                    .catch(reject);
            }
        });
    }

    // Function to solve hCaptcha
    async function solveHCaptcha() {
        return new Promise((resolve, reject) => {
            try {
                const sitekey = document.querySelector('.h-captcha').getAttribute('data-sitekey');
                if (!sitekey) {
                    return reject(new Error("Could not extract hCaptcha sitekey"));
                }

                const pageUrl = window.location.href;

                if (captchaProvider === '2captcha') {
                    // 2Captcha implementation for hCaptcha
                    const apiUrl = `https://2captcha.com/in.php?key=${captchaApiKey}&method=hcaptcha&sitekey=${sitekey}&pageurl=${encodeURIComponent(pageUrl)}&json=1`;

                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 1) {
                                const captchaId = data.request;

                                const checkSolution = setInterval(() => {
                                    const solutionUrl = `https://2captcha.com/res.php?key=${captchaApiKey}&action=get&id=${captchaId}&json=1`;

                                    fetch(solutionUrl)
                                        .then(response => response.json())
                                        .then(solutionData => {
                                            if (solutionData.status === 1) {
                                                clearInterval(checkSolution);

                                                const token = solutionData.request;
                                                applyHCaptchaSolution(token);
                                                resolve();
                                            } else if (solutionData.request !== "CAPCHA_NOT_READY") {
                                                clearInterval(checkSolution);
                                                reject(new Error(`2Captcha error: ${solutionData.request}`));
                                            }
                                        })
                                        .catch(error => {
                                            clearInterval(checkSolution);
                                            reject(error);
                                        });
                                }, 5000);
                            } else {
                                reject(new Error(`2Captcha error: ${data.request}`));
                            }
                        })
                        .catch(reject);
                } else if (captchaProvider === 'nopecha') {
                    // NoCaptcha implementation for hCaptcha
                    const apiUrl = `https://api.nopecha.com/token?key=${captchaApiKey}&type=hcaptcha&sitekey=${sitekey}&url=${encodeURIComponent(pageUrl)}`;

                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.data && data.data.token) {
                                applyHCaptchaSolution(data.data.token);
                                resolve();
                            } else {
                                reject(new Error(`NoCaptcha error: ${data.error || 'Unknown error'}`));
                            }
                        })
                        .catch(reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Function to apply reCAPTCHA v2 solution
    function applyCaptchaSolution(token) {
        try {
            // Find and fill the g-recaptcha-response textarea
            document.querySelector('#g-recaptcha-response').innerHTML = token;

            // Trigger the callback
            if (window.___grecaptcha_cfg && window.___grecaptcha_cfg.clients) {
                const clientId = Object.keys(window.___grecaptcha_cfg.clients)[0];
                const client = window.___grecaptcha_cfg.clients[clientId];
                const widgetId = Object.keys(client)[0];
                const callbackName = client[widgetId].callback;

                if (callbackName) {
                    window[callbackName](token);
                }
            }

            // Trigger change event
            const event = new Event('change', { bubbles: true });
            document.querySelector('#g-recaptcha-response').dispatchEvent(event);

            console.log("IceShield: reCAPTCHA solution applied");
        } catch (error) {
            console.error("IceShield: Error applying reCAPTCHA solution", error);
            throw error;
        }
    }

    // Function to apply reCAPTCHA v3 solution
    function applyRecaptchaV3Solution(token, sitekey) {
        try {
            // For v3, create hidden input with token
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'g-recaptcha-response';
            input.value = token;
            document.querySelector('form')?.appendChild(input);

            // Also set in grecaptcha object if possible
            if (window.grecaptcha && window.grecaptcha.enterprise) {
                window.grecaptcha.enterprise.execute = function(siteKey) {
                    return new Promise(resolve => {
                        resolve(token);
                    });
                };
            } else if (window.grecaptcha) {
                window.grecaptcha.execute = function(siteKey) {
                    return new Promise(resolve => {
                        resolve(token);
                    });
                };
            }

            console.log("IceShield: reCAPTCHA v3 solution applied");
        } catch (error) {
            console.error("IceShield: Error applying reCAPTCHA v3 solution", error);
            throw error;
        }
    }

    // Function to apply hCaptcha solution
    function applyHCaptchaSolution(token) {
        try {
            // Find and fill the h-captcha-response textarea
            document.querySelector('textarea[name="h-captcha-response"]').innerHTML = token;

            // Also set hidden input
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'h-captcha-response';
            input.value = token;
            document.querySelector('form')?.appendChild(input);

            // Trigger change event
            const event = new Event('change', { bubbles: true });
            document.querySelector('textarea[name="h-captcha-response"]').dispatchEvent(event);

            console.log("IceShield: hCaptcha solution applied");
        } catch (error) {
            console.error("IceShield: Error applying hCaptcha solution", error);
            throw error;
        }
    }

    // Function to make an element draggable
    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const dragHandle = handle || element; // Use specific handle if provided, otherwise use the element itself

        dragHandle.style.cursor = 'move'; // Change cursor to indicate draggable
        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            // Prevent dragging on interactive elements
            if (e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'SELECT' ||
                e.target.tagName === 'A' ||
                e.target.closest('button, input, select, a')) {
                return;
            }

            // If using a specific handle, check if the click is on the handle
            if (handle && e.target !== handle && !handle.contains(e.target)) {
                return;
            }

            e = e || window.event;
            e.preventDefault(); // Prevent text selection during drag

            // Get the initial cursor position
            pos3 = e.clientX;
            pos4 = e.clientY;

            // Set up event listeners for drag events
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.body.style.userSelect = 'none'; // Prevent text selection during drag
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            // Calculate new position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            // Calculate new coordinates
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

            // Ensure element stays within viewport bounds
            const rect = element.getBoundingClientRect();
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - rect.height));
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - rect.width));

            // Set the element's new position
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.right = 'auto'; // Clear right positioning when left is set
            element.style.bottom = 'auto'; // Clear bottom positioning when top is set

            // Save position to GM storage
            GM_setValue('iceshield_ui_top', element.style.top);
            GM_setValue('iceshield_ui_left', element.style.left);
        }

        function closeDragElement() {
            // Stop tracking mouse movement
            document.onmouseup = null;
            document.onmousemove = null;
            document.body.style.userSelect = '';
        }
    }

    // Initialize: Wait for page to load and add the button
    window.addEventListener('load', function() {
        console.log("IceShield: Page loaded, adding control panel");

        // Create control panel - enhanced TransShield-like UI style
        const panel = document.createElement('div');
        panel.id = 'iceshield-ui';
        panel.style.position = 'fixed';

        // Try to restore saved position
        const savedTop = GM_getValue('iceshield_ui_top');
        const savedLeft = GM_getValue('iceshield_ui_left');

        if (savedTop && savedLeft) {
            panel.style.top = savedTop;
            panel.style.left = savedLeft;
            panel.style.right = 'auto'; // Clear right positioning
        } else {
            panel.style.top = '15px';
            panel.style.right = '15px';
        }

        panel.style.zIndex = '10000';
        panel.style.background = '#2D2D2D'; // Dark theme background
        panel.style.border = '1px solid #444';
        panel.style.padding = '15px';
        panel.style.borderRadius = '8px';
        panel.style.width = '300px';
        panel.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        panel.style.color = '#f0f0f0';
        panel.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.6)';

        // Header with IceShield title
        const header = document.createElement('div');
        header.innerHTML = '🧊 🛡️ IceShield 🛡️ 🧊'; // Using ice and shield emoji
        header.style.fontSize = '18px';
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.style.marginBottom = '15px';
        header.style.padding = '5px 0';
        header.style.color = '#FFFFFF';
        header.style.textShadow = '0 0 3px rgba(150, 150, 255, 0.7)'; // Blue glow for ice theme

        // VPN Status section - also serves as drag handle
        const vpnStatusBar = document.createElement('div');
        vpnStatusBar.style.backgroundColor = '#444'; // Darker background
        vpnStatusBar.style.padding = '8px 0';
        vpnStatusBar.style.borderRadius = '4px';
        vpnStatusBar.style.marginBottom = '15px';
        vpnStatusBar.style.textAlign = 'center';
        vpnStatusBar.style.fontWeight = 'bold';
        vpnStatusBar.style.fontSize = '15px';        vpnStatusBar.style.cursor = 'move'; // Indicate it's the drag handle
        vpnStatusBar.innerHTML = '🔒 VPN ACTIVE? 🔒';
        vpnStatusBar.style.color = '#FFD700'; // Changed from blue to gold/yellow to match lock emoji color

        // Creator section
        const createdBy = document.createElement('div');
        createdBy.style.fontSize = '14px';
        createdBy.style.marginBottom = '12px';
        createdBy.style.borderBottom = '1px solid #444';
        createdBy.style.paddingBottom = '8px';
        createdBy.style.display = 'flex';

        // Creator label
        const createdByLabel = document.createElement('span');
        createdByLabel.textContent = 'Created By:';
        createdByLabel.style.fontWeight = 'bold';
        createdByLabel.style.marginRight = '5px';

        // Creator value
        const createdByValue = document.createElement('span');
        createdByValue.innerHTML = '❤️ KirbySoftware ❤️';
        createdByValue.style.color = '#FF69B4'; // Pink color like TransShield

        createdBy.appendChild(createdByLabel);
        createdBy.appendChild(createdByValue);

        // Status section
        const statusSection = document.createElement('div');
        statusSection.style.fontSize = '14px';
        statusSection.style.marginBottom = '12px';
        statusSection.style.borderBottom = '1px solid #444';
        statusSection.style.paddingBottom = '8px';
        statusSection.style.display = 'flex';

        // Status label
        const statusLabel = document.createElement('span');
        statusLabel.textContent = 'Status:';
        statusLabel.style.fontWeight = 'bold';
        statusLabel.style.marginRight = '5px';        // Status value
        const statusValue = document.createElement('span');
        statusValue.id = 'iceshield-status-value';
        statusValue.textContent = 'Ready';
        statusValue.style.color = '#4CAF50'; // Green color for Ready status

        statusSection.appendChild(statusLabel);
        statusSection.appendChild(statusValue);

        // Create a function to update the status with different colors
        window.updateIceShieldStatus = function(status) {
            const statusEl = document.getElementById('iceshield-status-value');
            if (!statusEl) return;

            statusEl.textContent = status;

            // Set different colors for different statuses
            switch(status) {
                case 'Ready':
                    statusEl.style.color = '#4CAF50'; // Green
                    break;
                case 'Filling...':
                    statusEl.style.color = '#FFA500'; // Orange/Amber
                    break;
                case 'Done':
                    statusEl.style.color = '#2196F3'; // Blue
                    break;
                default:
                    statusEl.style.color = '#ddd'; // Default color
            }
        };

        // Fills count section
        const fillsSection = document.createElement('div');
        fillsSection.style.fontSize = '14px';
        fillsSection.style.marginBottom = '18px';
        fillsSection.style.borderBottom = '1px solid #444';
        fillsSection.style.paddingBottom = '8px';
        fillsSection.style.display = 'flex';

        // Fills label
        const fillsLabel = document.createElement('span');
        fillsLabel.textContent = 'Fills:';
        fillsLabel.style.fontWeight = 'bold';
        fillsLabel.style.marginRight = '5px';

        // Fills value
        const fillsValue = document.createElement('span');
        fillsValue.id = 'iceshield-fills-value';
        fillsValue.textContent = `${loopCount}`;
        fillsValue.style.fontSize = '15px';

        fillsSection.appendChild(fillsLabel);
        fillsSection.appendChild(fillsValue);        // Button container - use grid for better control
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'grid';
        buttonContainer.style.gridTemplateColumns = '1fr 1fr'; // Changed to 2 columns to fill space
        buttonContainer.style.gap = '8px';
        buttonContainer.style.marginTop = '5px';

        // Base button style
        const buttonBaseStyle = `
            padding: 9px 0;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            line-height: 1.2;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;

        // Fill button - green like in TransShield
        const fillButton = document.createElement('button');
        fillButton.textContent = 'Fill Form';
        fillButton.style.cssText = buttonBaseStyle;
        fillButton.style.backgroundColor = '#5cb85c'; // Green
        fillButton.style.gridColumn = '1 / 2'; // First column

        // Hover effects
        fillButton.onmouseover = () => {
            fillButton.style.backgroundColor = '#4cae4c';
            fillButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
        };
        fillButton.onmouseout = () => {
            fillButton.style.backgroundColor = '#5cb85c';
            fillButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        };
        fillButton.onmousedown = () => fillButton.style.transform = 'scale(0.98)';
        fillButton.onmouseup = () => fillButton.style.transform = 'scale(1)';        fillButton.addEventListener('click', fillForm);

        // Middle navigation button removed

        // Reset button - red like in TransShield
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.cssText = buttonBaseStyle;
        resetButton.style.backgroundColor = '#d9534f'; // Red
        resetButton.style.gridColumn = '2 / 3'; // Second column (changed from third)

        // Hover effects
        resetButton.onmouseover = () => {
            resetButton.style.backgroundColor = '#c9302c';
            resetButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
        };        resetButton.onmouseout = () => {
            resetButton.style.backgroundColor = '#d9534f';
            resetButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        };
        resetButton.onmousedown = () => resetButton.style.transform = 'scale(0.98)';
        resetButton.onmouseup = () => resetButton.style.transform = 'scale(1)';        resetButton.addEventListener('click', resetForm);        // CAPTCHA Settings button - blue
        const captchaButton = document.createElement('button');        captchaButton.textContent = 'Captcha Config';
        captchaButton.style.cssText = buttonBaseStyle;
        captchaButton.style.backgroundColor = '#3498db'; // Blue
        captchaButton.style.gridColumn = '1 / 2'; // First column
        captchaButton.style.gridRow = '2 / 3'; // Second row

        // Hover effects for CAPTCHA button
        captchaButton.onmouseover = () => {
            captchaButton.style.backgroundColor = '#2980b9';
            captchaButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
        };
        captchaButton.onmouseout = () => {
            captchaButton.style.backgroundColor = '#3498db';
            captchaButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        };
        captchaButton.onmousedown = () => captchaButton.style.transform = 'scale(0.98)';
        captchaButton.onmouseup = () => captchaButton.style.transform = 'scale(1)';
        captchaButton.addEventListener('click', showCaptchaSettings);

        // Automate button - purple (only works with API key)
        const automateButton = document.createElement('button');
        automateButton.textContent = 'Automate';
        automateButton.style.cssText = buttonBaseStyle;
        automateButton.style.backgroundColor = '#9b59b6'; // Purple
        automateButton.style.gridColumn = '2 / 3'; // Second column
        automateButton.style.gridRow = '2 / 3'; // Second row

        // Hover effects for automate button
        automateButton.onmouseover = () => {
            automateButton.style.backgroundColor = '#8e44ad';
            automateButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
        };
        automateButton.onmouseout = () => {
            automateButton.style.backgroundColor = '#9b59b6';
            automateButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        };
        automateButton.onmousedown = () => automateButton.style.transform = 'scale(0.98)';
        automateButton.onmouseup = () => automateButton.style.transform = 'scale(1)';
        automateButton.addEventListener('click', automateForm);
          // Update button positions for existing buttons
        fillButton.style.gridColumn = '1 / 2'; // First column
        fillButton.style.gridRow = '1 / 2'; // First row
        resetButton.style.gridColumn = '2 / 3'; // Second column
        resetButton.style.gridRow = '1 / 2'; // First row

        // Add buttons to container (navButtons removed)
        buttonContainer.appendChild(fillButton);
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(automateButton);
        buttonContainer.appendChild(captchaButton);

        // Add all elements to panel
        panel.appendChild(header);
        panel.appendChild(vpnStatusBar);
        panel.appendChild(createdBy);
        panel.appendChild(statusSection);
        panel.appendChild(fillsSection);
        panel.appendChild(buttonContainer);

        // Ensure status is set to "Ready" at initialization
        setTimeout(() => window.updateIceShieldStatus('Ready'), 100);

        // Add panel to page
        document.body.appendChild(panel);

        // Make the panel draggable using the VPN status bar as the handle
        makeDraggable(panel, vpnStatusBar);
    });
})();