// ==UserScript==
// @name         IceShield
// @namespace    http://tampermonkey.net/
// @version      1.0.0
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

    // Load narrative data functions
    const narrativeDataScript = document.createElement('script');
    narrativeDataScript.src = 'https://raw.githubusercontent.com/yourusername/IceShield/main/narrative_data.js';
    document.head.appendChild(narrativeDataScript);

    const narrativeFunctionsScript = document.createElement('script');
    narrativeFunctionsScript.src = 'https://raw.githubusercontent.com/yourusername/IceShield/main/narrative_functions.js';
    document.head.appendChild(narrativeFunctionsScript);    // Core variables
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
        'The business is advertising itself as a legitimate staffing agency but is actually providing fraudulent work documentation to unauthorized workers.',
        'Agricultural products are being imported without proper USDA inspection by mislabeling their contents and country of origin.'
    ];    // Specific narratives mapped to violation types
    const criminalActivityNarratives = {
        'Benefit/Marriage Fraud': [
            'The individual has openly admitted to entering into a marriage solely for immigration benefits. They have stated they do not live with their spouse and have an arrangement to pay $10,000 for the marriage. They have shown me photos from a staged wedding ceremony.',
            'This business charges individuals $3,000-$5,000 to arrange fraudulent marriages for immigration benefits. They match foreign nationals with US citizens, coach them on how to answer immigration interview questions, and create fake evidence of shared lives.',
            'I have observed the individual meeting with multiple potential spouses at this location to discuss payment terms for marriage fraud. They have a price sheet for different services including marriage certificates, joint bank accounts, and coached interview preparation.',
            'The subject organizes "marriage arrangement parties" where foreign nationals are introduced to US citizens willing to marry for payment. I overheard discussions of fees ranging from $15,000 to $25,000, with additional charges for creating fraudulent joint financial records.',
            'I have evidence that this organization is facilitating fraudulent marriages. They create falsified documentation showing couples living together including doctored lease agreements, utility bills, and photographs. They openly discussed methods to deceive immigration interviewers.'
        ],
        'Bulk Cash Smuggling/Financial Crimes': [
            'Large amounts of cash (estimated $50,000+) are being stored at this location and prepared for transport across the border. I\'ve observed individuals counting and packaging currency in vacuum-sealed bags while discussing avoiding declaration requirements.',
            'The business is structured to hide money transfers. They collect cash from multiple sources, break it into smaller amounts under $10,000, and use different individuals to deposit the funds at various banks to avoid reporting requirements.',
            'I\'ve witnessed regular deliveries of cash in duffel bags to this location followed by individuals making multiple small deposits at different banks. They explicitly discussed avoiding "government reporting thresholds."',
            'Multiple individuals were observed at this location converting large sums of cash into cryptocurrency, gift cards, and money orders to avoid financial reporting requirements. They specifically mentioned avoiding "CTR triggers" and "keeping transactions untraceable."',
            'As an employee, I\'ve been instructed to process wire transfers using multiple different sender names for the same source of funds. Management explicitly stated this was to avoid "financial monitoring" and has prohibited maintaining records of these transactions.'
        ],
        'Child Exploitation/Pornography': [
            'I discovered a hidden server room at this location containing multiple hard drives with illegal content involving minors. The individuals operating this facility are using private networks to distribute this material internationally and charging for access.',
            'The subject was observed recruiting minors through online gaming platforms, offering them payment for inappropriate imagery. They maintain multiple electronic devices with sophisticated encryption software specifically to hide this activity.',
            'This business presents itself as a modeling agency but is actually creating exploitative content featuring minors. They specifically target vulnerable youth and manipulate them with promises of legitimate modeling careers while producing inappropriate content.',
            'I have observed the suspect using sophisticated encryption software and the dark web to access and distribute illegal content involving children. They maintain multiple dedicated devices that are kept hidden when not in use.',
            'The location operates as a front business but contains a separate secured area where digital content involving exploited minors is being produced and distributed. Multiple children have been brought to this location after hours.'
        ],
        'Cyber Crimes': [
            'This group is running a sophisticated phishing operation targeting government benefit systems. They use identity information purchased from the dark web to create fraudulent accounts and redirect funds to untraceable cryptocurrency wallets.',
            'The business is operating a network of computer systems dedicated to launching ransomware attacks against healthcare organizations. I\'ve observed them testing encryption software and discussing "target acquisition" and ransom payment methods.',
            'I discovered that employees at this location are accessing corporate networks without authorization to steal intellectual property and trade secrets. They maintain dedicated systems for storing stolen data and use sophisticated methods to cover their tracks.',
            'The subject operates a criminal hacking enterprise from this location, with multiple dedicated servers used for launching attacks against financial institutions. They openly discussed "carding operations" and methods to bypass security protections.',
            'This facility houses a sophisticated technical operation focused on compromising email accounts of businesses to conduct invoice fraud. They intercept legitimate business communications and substitute fraudulent payment instructions.'
        ],
        'Employment/Exploitation of Unlawful Workers': [
            'This business routinely hires undocumented workers, paying them significantly below minimum wage ($3-4/hour) in cash with no benefits or protections. Workers are threatened with deportation if they complain about dangerous working conditions.',
            'The company maintains two separate payroll systems - one official system for documented workers, and a cash-only system for undocumented workers who receive 40% less pay. They explicitly told me not to create any records for the "unofficial employees."',
            'I have witnessed the manager confiscating identification documents from foreign workers and restricting their movement outside working hours. Workers are housed in company-owned property where they are charged excessive rent deducted from their already minimal pay.',
            'This agricultural operation houses workers in severely substandard conditions with 15-20 people sharing a small dwelling with inadequate facilities. Workers report having to work 12-hour days with no days off and receiving partial payment or having pay unlawfully withheld.',
            'The construction company recruits undocumented workers from street corners, transports them to job sites, and routinely fails to pay the agreed wages. When workers complain, they are threatened with calls to immigration authorities.'
        ],
        'F/M Student Violations, Including OPT': [
            'This business is falsely claiming to employ foreign students on OPT, providing documentation for visa purposes while never actually having them work. The students pay $1,000 monthly for the fraudulent employment verification.',
            'The educational institution is knowingly maintaining student visa status for individuals who have never attended classes. They charge premium fees for this "ghost student" service and provide falsified attendance and grade records.',
            'I have evidence that this company is exploiting students on F-1 visas by requiring them to work far beyond the legally permitted hours, often 40+ hours per week during academic periods. Students who refuse are threatened with termination of their visa sponsorship.',
            'This organization presents itself as an educational institution but provides no actual instruction. Foreign students pay tuition solely to maintain visa status while working full-time elsewhere. The facility has classrooms that are never used.',
            'The business has a scheme where they officially "hire" foreign students on OPT but require them to return 70% of their stated salary in cash, creating the appearance of legitimate employment while actually collecting fees for visa maintenance.'
        ],
        'Fugitive Criminal Alien': [
            'I have confirmed that the individual residing at this address is using a false identity. Their actual name is [NAME] and they are wanted for serious criminal charges in their home country. They have admitted this to me directly and shown documentation of their original identity.',
            'The subject has been living at this location for approximately 6 months and has openly discussed fleeing criminal charges in their home country. They possess multiple identification documents with different names and have described their methods for evading detection.',
            'This business is knowingly employing and housing an individual who has admitted to me that they are evading an outstanding warrant from immigration authorities. They are using documentation belonging to a relative and are paid in cash to avoid detection.',
            'The individual has explicitly stated they were previously deported but re-entered illegally to avoid criminal prosecution in their home country. They maintain multiple identities with supporting documentation and regularly change their appearance.',
            'I have direct knowledge that the occupant of this residence is a fugitive with an outstanding removal order. They have shown me falsified identification documents they purchased and explained their methods for avoiding detection during routine interactions with authorities.'
        ],
        'Gang Related': [
            'This location serves as a meeting point for gang members involved in organized criminal activity. I have observed multiple individuals with distinctive gang tattoos conducting what appeared to be drug and weapons transactions while discussing territory control.',
            'The business operates as a front for gang activity, with regular meetings of known gang members occurring after hours. The back room contains gang paraphernalia including distinctive clothing, flags, and written materials outlining their territory and operations.',
            'I have witnessed individuals at this location discussing gang-related violence including specific plans for retaliation against rival groups. Multiple weapons were visible during these meetings, and they openly discussed controlling specific geographic areas.',
            'The property is being used for the recruitment and initiation of new gang members. I observed an initiation ceremony where new members were required to commit criminal acts as proof of loyalty while established members documented these activities.',
            'This establishment serves as a collection point for payments related to gang-controlled criminal enterprises. Money is delivered by various individuals throughout the day, counted on the premises, and recorded in ledgers with territory designations.'
        ],
        'Human Rights Violators': [
            'The individual residing at this location has admitted to me their involvement in government-sanctioned torture in their home country. They showed photographs documenting these acts and named specific victims while expressing no remorse.',
            'I have evidence that the subject participated in targeted killings of civilians based on their ethnicity in their home country. They have described these events in detail to me, including specific locations and methods used, while boasting about evading accountability.',
            'This individual has openly admitted to participating in the persecution of religious minorities in their country of origin. They described their role in destroying religious sites and detaining members of targeted groups, showing documentation of their official position.',
            'The subject has been recorded discussing their direct involvement in mass executions of political dissidents. They maintain photographs and documents from these events and have described in detail their role in these human rights violations.',
            'I have firsthand knowledge that this individual served as an official in a detention facility known for systematic torture and extrajudicial killings. They have explicitly described their command responsibility for these abuses and their methods of entering the United States using false documentation.'
        ],
        'Human Smuggling': [
            'This property is being used as a stash house for smuggled individuals. I have observed groups of 15-20 people being delivered at night, held for several days in crowded conditions, and then transported to various locations after payments are received.',
            'The business operates a transportation network specifically for human smuggling. They use modified vehicles with hidden compartments to move people across state lines after they have entered the country illegally. Drivers are paid $1,000 per person transported.',
            'I have witnessed the coordination of smuggling operations at this location, including the exchange of money, distribution of false identification documents, and arrangement of transportation for individuals who have entered the country illegally.',
            'The individuals at this location operate a sophisticated smuggling network. They coordinate with overseas contacts to arrange travel, provide detailed instructions on border crossing methods, and maintain safe houses like this one throughout the region.',
            'This warehouse facility is being used to hide individuals who have been smuggled into the country. I observed 30+ people living in makeshift quarters with minimal sanitation. Guards are posted to prevent anyone from leaving until additional payments are made to the smugglers.'
        ],
        'Human Trafficking (Forced Labor/Slavery)': [
            'Workers at this facility have had their identification documents confiscated and are forced to work 16+ hour days for minimal or no compensation. They are housed in locked quarters on-site and have explicitly told me they are not permitted to leave the premises.',
            'This business is trafficking individuals for forced labor. Victims are recruited overseas with promises of legitimate employment but upon arrival have their documents taken, are forced to live in company housing, and must work to pay off ever-increasing "debts" for transportation and housing.',
            'I have observed multiple individuals being held against their will at this location. They are transported to work sites each morning, returned to locked facilities at night, and subjected to physical abuse if they fail to meet work quotas or attempt to contact outsiders.',
            'The operators of this establishment are confiscating workers\' passports and visas, restricting their movement, and forcing them to provide services under threats of deportation and harm to their families. Workers are required to surrender most of their earnings as "fees."',
            'This agricultural operation is housing workers in inhumane conditions and forcing them to work excessive hours through debt bondage. New workers arrive regularly from overseas and immediately have their documents confiscated while being told they owe thousands for transportation costs.'
        ],
        'Immigration Telefraud': [
            'This facility operates a sophisticated call center that targets immigrants, impersonating immigration authorities and demanding payments to avoid deportation. I have observed their scripts and training materials that explicitly detail these fraudulent practices.',
            'I have evidence that this business is running an immigration scam operation where they call foreign nationals, claim to be USCIS officials, and demand payment to resolve fictional problems with their immigration status. They maintain multiple untraceable payment methods.',
            'The organization operates a call center using spoofed government phone numbers to target immigrants. They claim to be ICE or USCIS officials and threaten arrest or deportation unless immediate payment is made. They keep detailed lists of targets organized by national origin.',
            'This location houses a telefraud operation targeting immigrant communities. Operators work from scripts impersonating immigration officials and demand payment via gift cards or cryptocurrency. They specifically target recent immigrants with limited English proficiency.',
            'The business maintains a database of immigrants\' information purchased from data brokers and uses it to make targeted calls claiming immigration problems that can only be resolved through immediate payment. They rotate through different phone numbers and payment methods to avoid detection.'
        ],
        'Intellectual Property Rights': [
            'This facility is manufacturing counterfeit designer merchandise on a large scale. They remove labels from generic products, attach counterfeit designer labels, and repackage them with fake authentication materials. Monthly production exceeds 10,000 units.',
            'I have witnessed the systematic copying of proprietary software at this location. They maintain a server dedicated to removing digital protection measures from software products, which are then copied and sold with counterfeit license certificates.',
            'The business is importing generic pharmaceutical products, repackaging them with counterfeit branding of major manufacturers, and distributing them through a network of small pharmacies. Their operation includes sophisticated equipment for producing authentic-looking packaging and security features.',
            'This production facility is creating exact copies of patented automotive parts, applying counterfeit branding, and selling them as authentic manufacturer products. They specifically target high-margin safety components where differences are difficult for consumers to detect.',
            'The organization is illegally manufacturing counterfeit electronics using inferior components that present serious safety hazards. They duplicate trademarked branding, packaging, and even security features and certificates of authenticity.'
        ],
        'Narcotics Smuggling': [
            'This warehouse is being used to store and distribute large quantities of narcotics. I have observed vehicles arriving at night, unloading concealed packages, and departing with different packages. Guards are posted during these operations and specifically mention avoiding detection by law enforcement.',
            'I have direct knowledge that this property serves as a distribution hub for narcotics. Hidden compartments have been built into the walls and floors specifically for storing controlled substances, and regular deliveries arrive in vehicles with concealed compartments.',
            'The business operates as a front for narcotics distribution. While appearing to be a legitimate operation during business hours, after closing, different individuals arrive to package and distribute controlled substances from the back rooms of the facility.',
            'This transportation company is involved in smuggling narcotics concealed within legitimate cargo shipments. I have observed employees removing hidden packages from freight containers and overheard explicit discussions about delivery schedules and payment arrangements.',
            'The location serves as a processing facility where raw narcotic materials are converted into retail quantities. Specialized equipment is maintained on site, ventilation systems have been modified to reduce detectable odors, and armed individuals provide security during operations.'
        ],
        'Terrorism Related': [
            'I have observed multiple meetings at this location where individuals have explicitly discussed plans to commit acts of violence against government facilities. They maintain maps, schedules, and have conducted surveillance of potential targets.',
            'This facility is being used for the assembly of explosive devices. I have observed the acquisition of precursor chemicals, detonators, and other components, along with technical discussions about maximizing casualties at specifically identified locations.',
            'The organization operating from this location is recruiting individuals for violent extremist activities. They maintain propaganda materials, conduct radicalization sessions, and have explicit discussions about attacking civilian targets to advance their ideological objectives.',
            'Individuals at this location are coordinating financial support for known terrorist organizations. They use sophisticated methods to conceal the sources and destinations of funds and maintain communication with overseas extremist groups.',
            'This location serves as a meeting point for members of an extremist group planning violent attacks. They maintain weapons, conduct training exercises, and have explicitly discussed targeting critical infrastructure and civilian gatherings.'
        ],
        'Trade Exportation Violation': [
            'This business is deliberately mislabeling export shipments to circumvent restrictions on technology transfers. They disassemble controlled items, label them as generic parts, and provide reassembly instructions to overseas recipients specifically to evade export controls.',
            'I have witnessed the falsification of export documentation at this location to conceal the actual contents of shipments destined for sanctioned countries. The company maintains a separate set of actual shipping records in a secured server.',
            'This facility is shipping controlled technology to prohibited foreign entities by routing it through multiple intermediate destinations. They maintain detailed instructions for removing identifying markings and replacing them with generic labels to avoid detection.',
            'The company is knowingly exporting restricted dual-use equipment to prohibited end users by falsifying End User Certificates and routing shipments through front companies in non-restricted countries. Internal documentation explicitly acknowledges the legal violations involved.',
            'I have observed the systematic removal of identification markings from export-controlled components before shipping. The business maintains separate documentation of the actual contents and destinations, with explicit instructions to circumvent trade restrictions.'
        ],
        'Trade Importation Violation': [
            'This business is deliberately misclassifying imported goods to avoid tariffs and import restrictions. They maintain two sets of inventory records - one official record for documented products, and another with falsified descriptions for customs declarations.',
            'I have witnessed the routine falsification of country-of-origin documentation for products imported from sanctioned countries. The goods are shipped to an intermediate country where packaging is altered before being imported with fraudulent documentation.',
            'The company is importing counterfeit safety-certified products with falsified certification marks. Internal communications explicitly acknowledge these products do not meet applicable safety standards but are represented as compliant to avoid import restrictions.',
            'This facility regularly removes and replaces country-of-origin markings on imported goods to avoid tariffs and restrictions. They maintain dedicated equipment for this purpose and train staff on methods to make the alterations undetectable to customs inspectors.',
            'I have observed the systematic altering of import documentation to understate the value of shipments. The business maintains records of the actual transactions showing values often 5-10 times higher than what is declared to customs authorities.'
        ],
        'Weapons Smuggling': [
            'This facility is being used to receive and redistribute illegal firearms. I have observed crates of weapons being delivered at night, serial numbers being removed, and the weapons being repackaged for distribution through a network of associates.',
            'The business serves as a front for illegal weapons transactions. Modified firearms and prohibited accessories are stored in a hidden room accessible through a concealed entrance, and transactions occur after regular business hours.',
            'I have direct knowledge that this location is used for converting legal firearms into fully automatic weapons. They maintain specialized tools and parts specifically for this purpose, and completed weapons are sold to individuals without background checks.',
            'This warehouse is used for the assembly and distribution of "ghost guns" - firearms without serial numbers assembled from parts kits. They maintain multiple 3D printers and CNC machines dedicated to producing untraceable firearms components.',
            'The organization is smuggling illegal firearms components by concealing them within shipments of legal products. They maintain a workshop where these components are assembled into complete weapons before being sold through an underground distribution network.'
        ],
        'Other (i.e., COVID-19 Fraud, Illegal Immigration, etc.)': [
            'This organization is providing fraudulent COVID-19 vaccination records and test results. They have access to official-looking certificates, medical record systems, and stamps which they sell to individuals seeking to circumvent vaccination requirements.',
            'The business is manufacturing and distributing counterfeit personal protective equipment that does not meet safety standards. They falsify certification documents and testing results while explicitly acknowledging in internal communications that their products provide inadequate protection.',
            'I have evidence that this entity is operating an unlicensed money transmission business specifically for undocumented individuals. They charge excessive fees (20-30% of transfer amounts) and maintain no required anti-money laundering protocols or records.',
            'This facility operates as an unlicensed medical clinic providing treatments and prescriptions without proper licensing or qualifications. They specifically target immigrant communities with limited access to legitimate healthcare, charging excessive fees for treatments of questionable safety.',
            'The organization is creating and selling sophisticated fraudulent immigration documents including green cards, work permits, and social security cards. They maintain specialized printing equipment, hologram applicators, and authentic-appearing security features.'
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
        const city = getRandomElement(countryData.cities);        // Generate postal code in format appropriate for the selected country
        let zip;
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Define letters outside switch for reuse

        // Assign postal code format based on country patterns
        switch (countryData.postalFormat) {
            case 'UK':
                // UK-style postal code (alphanumeric)
                zip = letters.charAt(Math.floor(Math.random() * letters.length)) +
                      letters.charAt(Math.floor(Math.random() * letters.length)) +
                      Math.floor(Math.random() * 10) +
                      ' ' +
                      Math.floor(Math.random() * 10) +
                      letters.charAt(Math.floor(Math.random() * letters.length)) +
                      letters.charAt(Math.floor(Math.random() * letters.length));
                break;
            case 'Canada':
                // Canadian postal code (letter-number-letter number-letter-number)
                zip = letters.charAt(Math.floor(Math.random() * letters.length)) +
                      Math.floor(Math.random() * 10) +
                      letters.charAt(Math.floor(Math.random() * letters.length)) +
                      ' ' +
                      Math.floor(Math.random() * 10) +
                      letters.charAt(Math.floor(Math.random() * letters.length)) +
                      Math.floor(Math.random() * 10);
                break;
            case 'Japan':
                // Japanese postal code (3-digit dash 4-digit)
                zip = (Math.floor(Math.random() * 900) + 100) + '-' +
                      (Math.floor(Math.random() * 9000) + 1000);
                break;
            case 'digits4':
                // 4-digit postal code
                zip = Math.floor(Math.random() * 9000) + 1000;
                break;
            case 'digits5':
                // 5-digit postal code
                zip = Math.floor(Math.random() * 90000) + 10000;
                break;
            case 'digits6':
                // 6-digit postal code
                zip = Math.floor(Math.random() * 900000) + 100000;
                break;
            default:
                // Default to 5-digit postal code
                zip = Math.floor(Math.random() * 90000) + 10000;
        }

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
        const zipField = document.querySelector('input[name*="zip" i], input[name*="postal" i], input[placeholder*="zip" i], input[placeholder*="postal" i]');

        // Fill common fields
        if (line1Field) line1Field.value = address.line1;
        if (line2Field) line2Field.value = address.line2;
        if (cityField) cityField.value = address.city;
        if (zipField) zipField.value = address.zip;

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
    }

    // Function to fill the "Where are you reporting from?" section
    function fillReportingLocation() {
        console.log("IceShield: Filling reporting location section");

        // Find the radio buttons for "Inside the U.S." and "Outside of the U.S."
        const insideUSRadio = document.querySelector('input[name="where_are_you_reporting_from_radios"][value="INSIDE"]');
        const outsideUSRadio = document.querySelector('input[name="where_are_you_reporting_from_radios"][value="OUTSIDE"]');

        // Randomly select inside (80%) or outside (20%) of US
        const isInsideUS = Math.random() < 0.8;

        // Select the appropriate radio button
        if (insideUSRadio && isInsideUS) {
            insideUSRadio.checked = true;
            triggerInputEvent(insideUSRadio);
            console.log("IceShield: Selected 'Inside the U.S.' reporting location");
        } else if (outsideUSRadio && !isInsideUS) {
            outsideUSRadio.checked = true;
            triggerInputEvent(outsideUSRadio);
            console.log("IceShield: Selected 'Outside of the U.S.' reporting location");
        } else {
            console.log("IceShield: Could not find reporting location radio buttons");
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
            }

            if (zipField) {
                zipField.value = reporterAddress.zip;
                triggerInputEvent(zipField);
                console.log("IceShield: Filled reporter zip code:", reporterAddress.zip);
            } else {
                console.log("IceShield: Reporter zip code field not found");
            }            // Handle state/country selection based on inside/outside US selection
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
        }

        if (businessZipField) {
            businessZipField.value = businessAddress.zip;
            triggerInputEvent(businessZipField);
            console.log("IceShield: Filled business zip");
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
                    const found = findInputByLabel(label);
                    if (found) {
                        businessZipField = found;
                        console.log("IceShield: Found business zip field by label:", label);
                        businessZipField.value = businessAddress.zip;
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
                }

                if (!businessZipField && visibleFields.zip) {
                    businessZipField = visibleFields.zip;
                    businessZipField.value = businessAddress.zip;
                    triggerInputEvent(businessZipField);
                    console.log("IceShield: Filled business zip using visible text detection");
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
                    const found = findInputByLabel(label);
                    if (found) {
                        individualZipField = found;
                        console.log("IceShield: Found individual zip field by label:", label);
                        individualZipField.value = address.zip;
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
                }

                if (!individualZipField && visibleFields.zip) {
                    individualZipField = visibleFields.zip;
                    individualZipField.value = address.zip;
                    triggerInputEvent(individualZipField);
                    console.log("IceShield: Filled individual zip using visible text detection");
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