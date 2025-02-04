// Yasaklı kelimeler listesi
const bannedWords = ["kötükelime1", "kötükelime2", "kötükelime3"];

// Admin modu durumu
let adminMode = false;

// Kullanıcı harfleri için başlangıç değeri
let userLetters = JSON.parse(localStorage.getItem('userLetters')) || {};

// Sayfa yüklendiğinde kayıtlı mesajları yükle
window.addEventListener('load', loadMessages);

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Yeni satır eklemeyi engelle
        sendMessage();
    }
});

document.getElementById('admin-mode-toggle').addEventListener('click', toggleAdminMode);

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message !== '') {
        // Yasaklı kelimeleri kontrol et
        if (containsBannedWords(message)) {
            alert("Mesajınız yasaklı kelimeler içeriyor!");
            return;
        }

        // Kullanıcıya bir harf ata (veya mevcut harfini al)
        const userId = generateUserId(); // Benzersiz kullanıcı ID'si oluştur
        const userLetter = getUserLetter(userId);

        // Mesajı sohbet kutusuna ekle
        addMessageToChat(message, 'sent', userLetter);

        // Mesajı localStorage'a kaydet
        saveMessage(message, 'sent', userLetter);

        // Input alanını temizle
        input.value = '';

        // Sohbet kutusunu en alt kaydır
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Mesajı sohbet kutusuna ekleyen fonksiyon
function addMessageToChat(message, type, userLetter) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerHTML = `<span class="user-letter">${userLetter}</span><p>${message}</p>`;
    chatMessages.appendChild(messageElement);

    // Admin modu açıksa "Sil" butonu ekle
    if (adminMode && type === 'sent') {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            chatMessages.removeChild(messageElement);
            removeMessageFromStorage(message); // Mesajı localStorage'dan da sil
        });
        messageElement.appendChild(deleteButton);
    }
}

// Mesajı localStorage'a kaydeden fonksiyon
function saveMessage(message, type, userLetter) {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push({ text: message, type: type, userLetter: userLetter });
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Mesajı localStorage'dan silen fonksiyon
function removeMessageFromStorage(message) {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const updatedMessages = messages.filter(msg => msg.text !== message);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
}

// Kayıtlı mesajları yükleyen fonksiyon
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const chatMessages = document.getElementById('chat-messages');
    messages.forEach(msg => {
        addMessageToChat(msg.text, msg.type, msg.userLetter);
    });
}

// Yasaklı kelimeleri kontrol eden fonksiyon
function containsBannedWords(message) {
    for (const word of bannedWords) {
        if (message.toLowerCase().includes(word.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// Admin modunu açıp kapatan fonksiyon
function toggleAdminMode() {
    adminMode = !adminMode;
    const adminButton = document.getElementById('admin-mode-toggle');
    adminButton.textContent = `Admin Modu: ${adminMode ? 'Açık' : 'Kapalı'}`;
}

// Benzersiz kullanıcı ID'si oluşturan fonksiyon
function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9); // Rastgele bir ID oluştur
}

// Kullanıcıya bir harf atayan fonksiyon
function getUserLetter(userId) {
    if (!userLetters[userId]) {
        // Mevcut harfleri kontrol et ve yeni bir harf ata
        const usedLetters = new Set(Object.values(userLetters));
        for (let charCode = 65; charCode <= 90; charCode++) { // A-Z arası harfler
            const letter = String.fromCharCode(charCode);
            if (!usedLetters.has(letter)) {
                userLetters[userId] = letter;
                localStorage.setItem('userLetters', JSON.stringify(userLetters));
                break;
            }
        }
    }
    return userLetters[userId];
}