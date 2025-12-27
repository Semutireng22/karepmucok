const { TronWeb } = require('tronweb');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline-sync');

// --- WARNO & UI UTILS ---
const C = {
    normal: "\x1b[0m",
    padang: "\x1b[1m",
    remeng: "\x1b[2m",
    abang: "\x1b[31m",
    ijo: "\x1b[32m",
    kuning: "\x1b[33m",
    biru: "\x1b[34m",
    ungu: "\x1b[35m",
    langit: "\x1b[36m",
    putih: "\x1b[37m",
};

const LOGO = `
${C.langit}╔══════════════════════════════════════════════════════╗
║              ${C.kuning}${C.padang}BITCOIN YAY AUTOMATION${C.langit}                  ║
║                                                      ║
║          ${C.putih}Github   : ${C.ijo}semutireng22${C.langit}                     ║
║          ${C.putih}Telegram : ${C.ijo}@jodohsaya${C.langit}                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝${C.normal}
`;

const FINAL_NOTE = `
${C.langit}╔══════════════════════════════════════════════════════╗
║    ${C.putih}OJO CUMA GAE TAPI RA DUKUNG CHANNELE SENG GAWE${C.langit}    ║
║             ${C.kuning}https://t.me/skyairdrop_hub${C.langit}              ║
╚══════════════════════════════════════════════════════╝${C.normal}
`;

class Spinner {
    constructor(text) {
        this.text = text;
        this.chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        this.interval = null;
        this.index = 0;
    }

    start() {
        process.stdout.write("\x1B[?25l");
        this.interval = setInterval(() => {
            const char = this.chars[this.index++ % this.chars.length];
            process.stdout.write(`\r${C.langit}${char}${C.normal} ${this.text}`);
        }, 100);
    }

    update(text) {
        this.text = text;
    }

    stop(status = 'done', newText = null) {
        clearInterval(this.interval);
        process.stdout.write("\r\x1B[K"); // Clear line
        process.stdout.write("\x1B[?25h"); // Show cursor

        if (status === 'silent') return;

        let prefix = `${C.biru}[INFONE]${C.normal}`;

        if (status === 'fail') {
            prefix = `${C.abang}[AMBYAR]${C.normal}`;
        }
        if (status === 'warn') {
            prefix = `${C.kuning}[ATI-ATI]${C.normal}`;
        }

        const finalMsg = newText || this.text;
        console.log(`${prefix} ${finalMsg}`);
    }
}

function log(type, msg) {
    const time = new Date().toLocaleTimeString();
    let prefix = `${C.remeng}${C.normal}`;
    if (type === 'info') prefix += `${C.biru}[INFONE]${C.normal}`;
    if (type === 'success') prefix += `${C.ijo}[BERES]${C.normal}`;
    if (type === 'error') prefix += `${C.abang}[AMBYAR]${C.normal}`;
    if (type === 'warn') prefix += `${C.kuning}[ATI-ATI]${C.normal}`;

    console.log(`${prefix} ${msg}`);
}

// --- CONFIG ---
const API_BASE = 'https://api.v1.indexx.ai/api/v1/inex';
const HEADERS_COMMON = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://bitcoinyay.com',
    'priority': 'u=1, i',
    'referer': 'https://bitcoinyay.com/',
    'sec-ch-ua': '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'
};

const HEADERS_GUERRILLA = {
    'User-Agent': HEADERS_COMMON['user-agent']
};

// --- UTILS ---
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomSleep(min = 2000, max = 5000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    const spinner = new Spinner(`Sek, mikir diluk...`);
    spinner.start();
    await sleep(delay);
    spinner.stop('silent');
}

function randomString(length, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateUsername() {
    return 'User' + randomString(6, 'abcdefghijklmnopqrstuvwxyz') + randomString(2, '0123456789');
}

function generatePassword() {
    const specials = '!@#$%^&*';
    return randomString(5, 'abcdefghijklmnopqrstuvwxyz') +
        randomString(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') +
        randomString(2, '0123456789') +
        specials.charAt(Math.floor(Math.random() * specials.length));
}

function generatePhone() {
    const area = Math.floor(Math.random() * 800) + 200;
    const mid = Math.floor(Math.random() * 900) + 100;
    const last = Math.floor(Math.random() * 9000) + 1000;
    return `1${area}${mid}${last}`;
}

const FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
    "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
    "Christopher", "Lisa", "Daniel", "Nancy", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
    "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kevin", "Dorothy", "Brian", "Carol", "George", "Amanda", "Edward", "Melissa", "Ronald", "Deborah",
    "Timothy", "Stephanie", "Jason", "Rebecca", "Jeffrey", "Sharon", "Ryan", "Laura", "Jacob", "Cynthia",
    "Gary", "Kathleen", "Nicholas", "Amy", "Eric", "Shirley", "Stephen", "Angela", "Jonathan", "Helen",
    "Larry", "Anna", "Justin", "Brenda", "Scott", "Pamela", "Brandon", "Nicole", "Benjamin", "Emma",
    "Samuel", "Samantha", "Gregory", "Katherine", "Alexander", "Christine", "Frank", "Debra", "Patrick", "Rachel",
    "Raymond", "Catherine", "Jack", "Carolyn", "Dennis", "Janet", "Jerry", "Heather", "Tyler", "Maria"
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
    "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
    "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
    "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"
];

function generateName() {
    return {
        first: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
        last: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    };
}

// --- GUERRILLA MAIL ---
async function getTempEmail() {
    const spinner = new Spinner("Sek gawe email anyar su...");
    spinner.start();
    try {
        const response = await axios.get('https://api.guerrillamail.com/ajax.php?f=get_email_address', { headers: HEADERS_GUERRILLA });
        spinner.stop('done', 'Email wes dadi cok');
        return {
            email: response.data.email_addr,
            sid_token: response.data.sid_token
        };
    } catch (e) {
        spinner.stop('fail', 'Gagal cok');
        log('error', `Gagal gawe email: ${e.message}`);
        return null;
    }
}

async function getOtp(sid_token) {
    const spinner = new Spinner("Ngenteni OTP mlebu...");
    spinner.start();
    let seq = 0;

    for (let i = 0; i < 30; i++) {
        spinner.update(`Ngenteni OTP mlebu... (Jajal ping ${i + 1}/30)`);
        await sleep(3000);
        try {
            const response = await axios.get(`https://api.guerrillamail.com/ajax.php?f=check_email&sid_token=${sid_token}&seq=${seq}`, { headers: HEADERS_GUERRILLA });
            const list = response.data.list;

            if (list && list.length > 0) {
                for (const email of list) {
                    if (email.mail_id > seq) seq = email.mail_id;
                    const mailDetail = await axios.get(`https://api.guerrillamail.com/ajax.php?f=fetch_email&sid_token=${sid_token}&email_id=${email.mail_id}`, { headers: HEADERS_GUERRILLA });
                    const body = mailDetail.data.mail_body;

                    const match = body.match(/\b\d{6}\b/);
                    if (match) {
                        spinner.stop('done', 'OTP ketemu su');
                        return match[0];
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }
    spinner.stop('fail', 'Gak onok OTP blas');
    return null;
}

// --- INDEXX API ---
async function checkUsername(username) {
    const spinner = new Spinner(`Ngecek Username: ${username}`);
    spinner.start();
    try {
        await axios.post(`${API_BASE}/user/checkusername`, { username }, { headers: HEADERS_COMMON });
        spinner.stop('done', `Aman, ${username} isok digae`);
        return true;
    } catch (e) {
        spinner.stop('fail', 'Gak iso digae');
        return false;
    }
}

async function checkEmail(email) {
    const spinner = new Spinner(`Ngecek Email: ${email}`);
    spinner.start();
    try {
        await axios.post(`${API_BASE}/user/checkemail`, { email }, { headers: HEADERS_COMMON });
        spinner.stop('done', 'Email aman, isok digae');
        return true;
    } catch (e) {
        spinner.stop('fail', 'Gak iso digae');
        return false;
    }
}

async function sendOtp(email) {
    const spinner = new Spinner("Ngirim OTP neng email...");
    spinner.start();
    try {
        await axios.post(`${API_BASE}/user/sendOtp`, { email, type: "New Register" }, { headers: HEADERS_COMMON });
        spinner.stop('done', 'OTP wes dikirim');
        return true;
    } catch (e) {
        spinner.stop('fail', 'Gagal kirim');
        log('error', `Gagal kirim OTP: ${e.message}`);
        return false;
    }
}

async function validateOtp(email, code) {
    const spinner = new Spinner(`Nyocokno OTP: ${code}`);
    spinner.start();
    try {
        await axios.post(`${API_BASE}/user/validateOtp`, { email, code }, { headers: HEADERS_COMMON });
        spinner.stop('done', 'OTP-ne cocok');
        return true;
    } catch (e) {
        spinner.stop('fail', 'Gak cocok');
        return false;
    }
}

async function registerApp(profile, email, password, referralCode) {
    const spinner = new Spinner("Daftar akun sek...");
    spinner.start();
    try {
        const payload = {
            firstName: profile.first,
            lastName: profile.last,
            username: profile.username,
            countryCode: "+1",
            country: "United States",
            phoneNumber: profile.phone,
            email: email,
            password: password,
            confirmPassword: password,
            referralCode: referralCode || ""
        };
        await axios.post(`${API_BASE}/user/registerwithapp`, payload, { headers: HEADERS_COMMON });
        spinner.stop('done', 'Sukses daftar');
        return true;
    } catch (e) {
        spinner.stop('fail', 'Gagal daftar');
        log('error', `Gagal Daftar: ${e.response ? JSON.stringify(e.response.data) : e.message}`);
        return false;
    }
}

async function joinAirdrop(email, walletAddr, referralCode) {
    const spinner = new Spinner("Melok airdrop...");
    spinner.start();
    try {
        const payload = {
            email: email,
            referralCode: referralCode || "",
            userType: "Indexx Exchange",
            walletAddress: walletAddr,
            walletProvider: "",
            airdropAmount: 0,
            tokenName: "BTCY",
            eventType: "bitcoin-yay New Year Airdrop"
        };
        await axios.post(`${API_BASE}/basic/registerbtcyairdrop`, payload, { headers: HEADERS_COMMON });
        spinner.stop('done', 'Wes melok airdrop!');
        return true;
    } catch (e) {
        spinner.stop('fail', 'Gagal melok');
        log('error', `Gagal Airdrop: ${e.message}`);
        return false;
    }
}

// --- MAIN ---
async function main() {
    process.stdout.write('\x1Bc');
    console.log(LOGO);

    const tronWeb = new TronWeb({
        fullNode: 'https://api.trongrid.io',
        solidityNode: 'https://api.trongrid.io',
        eventServer: 'https://api.trongrid.io'
    });

    const countStr = readline.question(`${C.kuning}?>${C.normal} Pirang akun bos? `);
    const count = parseInt(countStr, 10);
    const referralCode = readline.question(`${C.kuning}?>${C.normal} Kode Referral (opsional ae): `);

    console.log(`\n${C.ijo}Mulai ngerjakno ${count} akun su...${C.normal}\n`);

    for (let i = 0; i < count; i++) {
        console.log(`${C.ungu}====================================================${C.normal}`);
        console.log(`${C.ungu}   PROSES AKUN KE-${i + 1} SEKO ${count} ${C.normal}`);
        console.log(`${C.ungu}====================================================${C.normal}`);

        await randomSleep(1000, 3000);

        // 1. Data Gen
        const username = generateUsername();
        const password = generatePassword();
        const phone = generatePhone();
        const name = generateName();

        log('info', `Identitas Anyar: ${C.padang}${name.first} ${name.last}${C.normal}`);

        // 2. Wallet Gen
        const account = await tronWeb.createAccount();
        const walletAddr = account.address.base58;
        const walletPk = account.privateKey;
        log('info', `Alamatem: ${C.langit}${walletAddr}${C.normal}`);

        // 3. Email Gen
        await randomSleep();
        const emailData = await getTempEmail();
        if (!emailData) {
            log('error', `Gagal nggawe email gawe akun ke-${i + 1}. Skip sek.`);
            continue;
        }
        const { email, sid_token } = emailData;
        log('info', `Emailem Anyar: ${C.langit}${email}${C.normal}`);

        // 4. API Flow
        await randomSleep();
        if (!await checkUsername(username)) {
            log('error', `Username ${username} wes digae uwong. Skip sek.`);
            continue;
        }

        await randomSleep();
        if (!await checkEmail(email)) {
            log('error', `Email ${email} gak iso digae. Skip sek.`);
            continue;
        }

        await randomSleep();
        if (!await sendOtp(email)) {
            log('error', `Gagal ngirim OTP ndek ${email}. Skip sek.`);
            continue;
        }

        await randomSleep();
        const otp = await getOtp(sid_token);
        if (!otp) {
            log('error', `Gagal ntuk OTP gawe ${email}. Skip sek.`);
            continue;
        }
        log('success', `OTP mlebu su: ${C.ijo}${otp}${C.normal}`);

        await randomSleep();
        if (!await validateOtp(email, otp)) {
            log('error', `OTP e salah gawe ${email}. Skip sek.`);
            continue;
        }
        log('success', `OTP cocok gawe ${email}.`);

        await randomSleep(2000, 5000);
        const profile = { first: name.first, last: name.last, username, phone };
        log('info', `Daftar dadi ${username}...`);

        if (!await registerApp(profile, email, password, referralCode)) {
            log('error', `Gagal daftar akun ${username}. Skip sek.`);
            continue;
        }
        log('success', `Akun ${username} wes dadi sukses.`);

        await randomSleep();
        if (await joinAirdrop(email, walletAddr, referralCode)) {
            log('success', `Wes melok airdrop gawe ${email}.`);
            // Save Data
            const logData = `Email: ${email}\nPassword: ${password}\nUsername: ${username}\nName: ${name.first} ${name.last}\nPhone: ${phone}\nTronAddress: ${walletAddr}\nPrivateKey: ${walletPk}\n=====================================\n`;
            fs.appendFileSync('accounts.txt', logData);
            log('success', `${C.ijo}Data wes disimpen ndek accounts.txt${C.normal}`);
        } else {
            log('warn', `Gagal melok airdrop gawe ${email}. Tapi datane tetep disimpen.`);
            const logData = `Email: ${email}\nPassword: ${password}\nUsername: ${username}\nName: ${name.first} ${name.last}\nPhone: ${phone}\nTronAddress: ${walletAddr}\nPrivateKey: ${walletPk}\n=====================================\n`;
            fs.appendFileSync('accounts.txt', logData);
            log('success', `${C.ijo}Akun tetep disimpen ndek accounts.txt masio gagal airdrop.${C.normal}`);
        }
    }
    console.log(FINAL_NOTE);
}

main();
