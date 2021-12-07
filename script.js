const Modal = {
    //tentar criar uma função Toogal no lugar
    open() {
        // Abrir o Modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close() {
        // Fechar o Modal
        // remover a class active ao modal
        document.querySelector('.modal-overlay')
        .classList.remove('active')

    }
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || [] // Transforma a string em array novamente

    },

    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions)) //Transforma o array em uma string

    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload();

    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload();

    },

    incomes() {
        let income = 0; // Pegar todas as transações
        
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ){ // se for maior q zero
                income = income + transaction.amount; // somar a uma variavel e retornar a variavel
            }
        })
        
        return income;
    },
    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction =>{
            if(transaction.amount < 0){
                expense = expense + transaction.amount;
            }
        })

        return expense;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();

    },
}

// Pegar as transações do objeto(JS) e colocar no HTML
// Substituir os dados do HTML para os dados JS

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transações">
            </td>
        
        `
        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    },
}

const Utils = {
  
    formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100
        
        
        return value
    },

    formatDate(date){
        const splittedDate = date.split("-") //fazer uma separação
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "") //entre barras oq quero buscar,  D td que não é um numero, g quer dizer global, "" o argumento que quero substituir

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }

    },

    validateFields() {
        const {description, amount, date} = Form.getValues()
        
        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos!")
            }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },

  
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

    },



    submit(event) {
        event.preventDefault()

        try{
            Form.validateFields() // Verificar se todas as informações foram preenchidas
            const transaction = Form.formatValues() // Formatar os dados para salvar
            Transaction.add(transaction)  // salvar ou adicionar transações
            Form.clearFields() // apagar os dados do formulário
            Modal.close() // Modal fechar

        } catch(error) {
            alert(error.message)
        }

    }
        
}

const App ={
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance();

        Storage.set(Transaction.all)

    },
    
    reload(){
        DOM.clearTransactions();
        App.init();

    },
}


App.init()

