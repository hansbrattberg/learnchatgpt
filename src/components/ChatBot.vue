<template>
    <div class="iphone-screen">
        <div>
            <select v-model="selectedLanguageOption" @change="handleLanguageSelectionChange">
                <option value="Svenska">Svenska</option>
                <option value="English">English</option>
            </select>

            <select v-model="selectedModelOption" @change="handleModelSelectionChange">
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4">gpt-4</option>
            </select>
        </div>
        <div class="chat-window">
            <div class="chat-messages">
                <ul>
                    <li v-for="message in this.messages" :key="message"
                        :class="{ 'system-message': message.role === 'system', 'assistant-message': message.role === 'assistant', 'user-message': message.role === 'user', }">
                        <div class="message-bubble">
                            <span class="message-text" style="white-space: pre-line">{{ message.content }}</span>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="chat-input">
                <textarea v-model="newMessage" @keyup.enter="handleEnterKey"
                    placeholder="Type your message..."></textarea><br />
                <button @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'ChatBot',
    data() {
        return {
            selectedModelOption: 'gpt-4', // Default selected option
            selectedLanguageOption: 'Svenska', // Default selected option
            newMessage: '',
            waitingMessage: {
                role: 'assistant',
                content: 'waiting...'
            },
            messages: [],
            model: 'gpt-3.5-turbo',
            systemPrompt_eng: [
                {
                    role: 'system',
                    content:
                        `You are an experienced prompt writer for ChatGPT-4.
                         You always reply with breif answers.
                         The goal is to engage the user in an interactive learning session,
                         so that the user learns the basic prompt writing skills for ChatGPT-4.
                         Begin with the fundamental aspects of ChatGPT-4 prompt writing, and gradually introduce more advanced techniques.
                         The session shall be interactive, with you asking the user questions and providing feedback on my responses.
                         As each new concept is introduced, use repetition to reinforce learning and show examples from different use cases. 
                         The session should involve you asking the user questions one at a time, and then pausing to wait for my response before proceeding. 
                         Encourage the user to create sample prompts and provide constructive feedback on them. 
                         When the user has written a ChatGPT-4 prompt, demonstrate typical responses that ChatGPT-4 might generate. 
                         Incorporate real-life examples to illustrate the concepts being taught, and encourage the user to apply these techniques to various scenarios.
                         As the session progresses, guide the user through the nuances of refining prompts to optimize ChatGPT-4’s responses, 
                         with an emphasis on how to tailor prompts for specific use cases.`
                },
            ],
            systemPrompt_sv: [
                {
                    role: 'system',
                    content:
                        `Du är en erfaren promptförfattare för ChatGPT-4.
                         Du svarar alltid med korta svar.
                         Målet är att engagera användaren i en interaktiv inlärningssession,
                         så att användaren lär sig de grundläggande färdigheterna i promptskrivning för ChatGPT-4.
                         Börja med de grundläggande aspekterna av ChatGPT-4 promptskrivning, och introducera gradvis mer avancerade tekniker.
                         Sessionen ska vara interaktiv, med dig som ställer frågor till användaren och ger feedback på mina svar.
                         När varje nytt koncept introduceras, använd repetition för att förstärka inlärningen och visa exempel från olika användningsfall.
                         Sessionen bör innefatta att du ställer frågor till användaren en i taget, och sedan pausar för att vänta på mitt svar innan du fortsätter.
                         Uppmuntra användaren att skapa prov-prompter och ge konstruktiv feedback på dem.
                         När användaren har skrivit en ChatGPT-4-prompt, visa typiska svar som ChatGPT-4 kan generera.
                         Inkludera verkliga exempel för att illustrera de koncept som undervisas, och uppmuntra användaren att tillämpa dessa tekniker på olika scenarier.
                         När sessionen fortskrider, vägled användaren genom nyanserna av att finslipa prompter för att optimera ChatGPT-4:s svar,
                         med betoning på hur man anpassar prompter för specifika användningsfall.`
                },
            ],
            systemPrompt: this.systemPrompt_sv,
        }
    },

    async created() {
        this.messages = [...this.systemPrompt_sv];
        this.callServerAndUpdateChat();
    },

    methods: {

        handleLanguageSelectionChange() {
            if (this.selectedLanguageOption === 'Svenska') {
                this.systemPrompt = this.systemPrompt_sv;
            } else {
                this.systemPrompt = this.systemPrompt_eng;
            }
            this.messages = [...this.systemPrompt];
            this.callServerAndUpdateChat();
        },

        handleModelSelectionChange() {
            this.model = this.selectedModelOption;
            this.messages = [...this.systemPrompt];
            this.callServerAndUpdateChat();
        },

        handleEnterKey(event) {
            if (!event.shiftKey) {
                this.sendMessage();
            }
        },

        async sendMessage() {
            console.log("sendMessage called with newMessage: " + this.newMessage);

            if (this.newMessage.trim() !== "") {
                const userMessage = {
                    role: 'user',
                    content: this.newMessage
                };

                // Add user message and placeholder message to messages array
                this.callServerAndUpdateChat(userMessage);
            }
        },

        async callServerAndUpdateChat(userMessage) {
            if (userMessage) {
                this.messages = [...this.messages, userMessage];
            }

            const openAiParams = {
                model: this.model,
                messages: [...this.messages]
            };

            this.messages = [...this.messages, this.waitingMessage];
            this.newMessage = '';

            try {
                console.log("this.messages before", this.messages[this.messages.length - 1]);
                const responseData = await this.postMessageToServer(openAiParams);
                console.log("Received", responseData.message);

                // Update the waiting message text with the actual message
                this.messages[this.messages.length - 1] = { role: 'assistant', content: responseData.message };
                console.log("this.messages after", this.messages);

                // Trigger reactivity by replacing the messages array
                // this.messages = [...this.messages];

            } catch (error) {
                console.error(error);
                this.messages = [...this.messages, 'Error fetching response'];
            }
        },

        async postMessageToServer(openAiParams) {

            const response = await fetch('http://localhost:3000/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(openAiParams)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            return responseData;
        }

    }
};

</script>
  
<style>
.iphone-screen {
    max-width: 100%;
    margin: 0 auto;
    background-color: #f2f2f2;
    border-radius: 10px;
    padding: 10px;
}

.chat-window {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.chat-messages ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

.system-message {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 10px;
}

.assistant-message {
    display: flex;
    justify-content: flex-start;
    margin-top: 10px;
    margin-bottom: 10px;
}

.user-message {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: left;
}

.message-bubble {
    max-width: 70%;
    padding: 10px;
    border-radius: 20px;
    justify-content: flex-start;
    text-align: left;
    color: #fff;
}

.system-message .message-bubble {
    background-color: #EE625F;
}

.assistant-message .message-bubble {
    background-color: #55BCC9;
}

.user-message .message-bubble {
    background-color: #3F7CAC;
}

.message-bubble .message-text {
    word-wrap: break-word;
    text-align: left;
}

.chat-input textarea {
    width: 100%;
    max-width: 70%;
    height: 80px;
    resize: vertical;
}

input,
button {
    margin-right: 5px;
}
</style>
