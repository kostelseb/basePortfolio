(function (){

    // Методы создания клиента
    async function createClientMethod(name, surname,contacts, lastName = '', ) {
        await fetch('http://localhost:3000/api/clients', {
            method : 'POST',
            headers : {
                'Content-type' : 'application/json',
            },
            body: JSON.stringify({
                name:name,
                surname:surname,
                lastName: lastName,
                contacts : contacts
            })
        })
    }

    // метод для получения всех данных о клиентах. 
    // параметр id нужен для получения данных об определённом клиенте по id.
    // параметр searchRequest используется для создания поисковго запроса по определённым критериям 
    async function getClients(id = '', searchRequest = '') {
        let response
        if(id !== '') {
            response = await fetch(`http://localhost:3000/api/clients/${id}`)
        } else {
            response = await fetch(`http://localhost:3000/api/clients?${searchRequest}`)
        }
        const data = await response.json()
        // console.log(data)

        return data
    }

    // const a = createNewElement('h1', ['asd'],'asdasd')
    // document.body.append(a)
    // a.addEventListener('click', ()=> {
    //     asd('asd')
    // })
    // a.removeAttribute('click', ()=> {
    //     asd('asd')
    // })
    // function asd(asd='s') {
    //     console.log(asd)
    // }

    async function changeClientInformation(id, name, surname, lastName, contacts) {
        fetch(`http://localhost:3000/api/clients/${id}`, {
            method : 'PATCH',
            headers : {
                'Content-type' : 'application/json',
            },
            body : JSON.stringify({
                name: name,
                surname: surname,
                lastName: lastName,
                contacts: contacts
            })
        })
    }

    async function deleteClientMethod(id) {
        await fetch(`http://localhost:3000/api/clients/${id}`, {
            method : 'DELETE'
        })
    }

    //Создание формы поиска

    function createSearch() {
        const container = getContainer('search_container')
        const innerContainer = createNewElement('div', ['inner_search_container'])
        container.append(innerContainer)
        const logo = createNewElement('div', ['logo'])
        innerContainer.append(logo)
        const searchInput = createNewElement('input', ['search_input'])
        searchInput.placeholder = 'Введите запрос'
        innerContainer.append(searchInput)
        return container
    }

    function searchProcessing() {
        const container = createSearch()
        const searchInput = container.children[0].children[1]
        let timeout
        let searchRequest = ''
        searchInput.addEventListener('input', ()=>{
            clearTimeout(timeout)
            timeout = setTimeout(async ()=>{
                    let inputValue = searchInput.value
                    inputValue = inputValue.trim().split(' ')
                    inputValue.forEach(element => {
                        if(element.length > 0) {
                            searchRequest = searchRequest + `&search=${element}`
                        }
                    })
                    if(searchRequest === '') {
                        showTable('','','',true)
                    }else {
                        showTable(searchRequest,'','',true)
                    }
                    checkElementForDelete('table_row')
                    searchRequest = ''
                }, 300
            )
            
        }) 
    }

    // Создание и наполнение таблицы

    function getContainer(container_name) {
        const container = document.querySelector(`.${container_name}`)
        return container
    }

    function createNewElement (element, classes, textContent = '') {
        const tag = document.createElement(`${element}`)
        for(clas of classes) {
            tag.classList.add(`${clas}`)
        }
        if (textContent !== '') {
            tag.textContent = textContent
        }
        return tag
    }

     function createTable() {
        // let data = await tableData()
        checkElementForDelete('table')
        const container = getContainer('table_container')
        const table = createNewElement('table', ['table'])
        container.append(table)
        const tableHeadersRow = createNewElement('tr', ['table_headers'])
        table.append(tableHeadersRow)
        const tableHeaders = ['ID', 'Фамилия Имя Отчество', 'Дата и время создания', 'Последние изменения', 'Контакты', 'Действия' ]
        for (let i = 0; i < tableHeaders.length ; i++) {
            const tableHeader = createNewElement('th', ['table_header'], tableHeaders[i])
            if(i === 0) {
                tableHeader.classList.add('table_header_icon')
                tableHeader.classList.add('sorted')
            }
            tableHeader.addEventListener('click', ()=> {
                let tableHeaders = document.querySelectorAll('.table_header')
                for(let tableHeader of tableHeaders) {
                    if(tableHeader.classList.contains('table_header_icon')) {
                        tableHeader.classList.remove('table_header_icon')
                    }
                }
                tableHeader.classList.add('table_header_icon')
            })
            // switch(i){
            //     case 0:
            //         tableHeader.addEventListener('click', ()=> {
            //             eventForSort(tableHeader,'id',data)
            //         },{once:true})
            //         break
            //     case 1:
            //         // tableHeader.addEventListener('click', eventForSort(tableHeader,'fullName',data))
            //         break
            //     case 2:
            //         // tableHeader.addEventListener('click', eventForSort(tableHeader,'creteTime',data)) 
            //         break
            //     case 3:
            //         // tableHeader.addEventListener('click', eventForSort(tableHeader,'updateTime',data))
            //         break    
            // }
            tableHeadersRow.append(tableHeader)
        }

        return table
    }

    function eventForSort(elementForEvent='',fieldToSort='',data) {
        elementForEvent.addEventListener('click',()=>{
            checkElementForDelete('table_row')
            data.sort(sortByField(fieldToSort, 'forward'))
            if(elementForEvent.classList.contains('sorted')) {
                data.sort(sortByField(fieldToSort, 'reverse'))
            }
            elementForEvent.classList.toggle('sorted')
            showTable('', data,'',false)
        })
    }

    function User(id, fullName, createTime, updateTime, contacts, buttons) {
        this.id = id
        this.fullName = fullName
        this.createTime = createTime
        this.updateTime = updateTime
        this.contacts = contacts
        this.buttons = buttons
    }

    // serachRequest используется при отправке запроса с поиском клиента. В остальных случаях можно опустить
    // sortedData используется для получения статических данных без запроса к серверу для сортировки и отрисовки данных. В остальных случаях можно опустить
    async function tableData(searchRequest = '', sortedData = '') {
        if(sortedData !== '') {
            return sortedData
        }
        const clientsArray = await getClients('',searchRequest)
        let data = []
        let fullName
        const valueButtons = ['Изменить', 'Удалить']
        for (let i = 0; i < clientsArray.length; i++) {
            const createdTime = getDate(clientsArray[i].createdAt)
            const updatedTime = getDate(clientsArray[i].updatedAt)
            if (clientsArray[i].lastName === '') {
                fullName = `${clientsArray[i].name} ${clientsArray[i].surname}`
            } else {
                fullName = `${clientsArray[i].name} ${clientsArray[i].surname} ${clientsArray[i].lastName}`
            }
            const user = new User(clientsArray[i].id, fullName, createdTime, updatedTime, clientsArray[i].contacts, valueButtons )
            data.push(user)
        }

        return data
    }

    // serachRequest используется при отправке запроса с поиском клиента. В остальных случаях можно опустить
    // sortedData используется для получения статических данных без запроса к серверу для сортировки и отрисовки данных. В остальных случаях можно опустить
    async function showTable(searchRequest = '', sortedData = '', startedSortedField, addEvent = true) {
        const data = await tableData(searchRequest, sortedData)

        // console.log(data)
        if(startedSortedField !== '') {
            data.sort(sortByField(startedSortedField, 'forward'))
        }
        // const table = document.querySelector('table')
        if(addEvent === true) {
            const table = createTable()
            const tableHeaderId = table.children[0].children[0]
            const tableHeaderFullname = table.children[0].children[1]
            const tableHeaderCreateTime = table.children[0].children[2]
            const tableHeaderUpdateTime = table.children[0].children[3] 
            eventForSort(tableHeaderId, 'id', data)
            eventForSort(tableHeaderFullname, 'fullName', data)
            eventForSort(tableHeaderCreateTime, 'createTime', data)
            eventForSort(tableHeaderUpdateTime, 'updateTime', data)
            createTableValues(table)
        } else {
            const table = document.querySelector('table') 
            createTableValues(table)
        }
        function createTableValues(table) {
            for(let i = 0; i < data.length; i++) {
                let tr = createNewElement('tr', ['table_row'])
                for(let j = 0; j < 6; j++) {
                    const td = document.createElement('td')
                    td.classList.add('td_table')
                    switch(j) {
                        case 0 : 
                            const id = createNewElement('p', ['table_td_value','table_id'], data[i].id)
                            td.append(id)
                            break
                        case 1 :
                            const fullName = createNewElement('p', ['table_td_value','table_fullname'], data[i].fullName)
                            td.append(fullName)
                            break
                        case 2 :
                            const createDateContainer = createNewElement('div', ['table_createdate'])
                            const createdDate = createNewElement('p', ['table_td_value','table_date'], data[i].createTime.slice(0, 10))
                            const createdTime = createNewElement('p', ['table_td_value','table_time'], data[i].createTime.slice(11))
                            td.append(createDateContainer)
                            createDateContainer.append(createdDate)
                            createDateContainer.append(createdTime)
                            break
                        case 3 :
                            const updateDateContainer = createNewElement('div', ['table_updatedate'])
                            const updatedDate = createNewElement('p', ['table_td_value','table_date'], data[i].updateTime.slice(0, 10))
                            const updatedTime = createNewElement('p', ['table_td_value','table_time'], data[i].updateTime.slice(11))
                            td.append(updateDateContainer)
                            updateDateContainer.append(updatedDate)
                            updateDateContainer.append(updatedTime)
                            break
                        case 4 :
                            const contactContainer = createNewElement('div', ['contact_container'])
                            td.append(contactContainer)
                            let counter = 0
                            for (let k = 0; k < data[i].contacts.length; k++) {
                                const tdContact = createNewElement('div', ['table_td_value','table_contact'])
                                let tdContactValue
                                let tdContactLink
                                
                                if(data[i].contacts[k].type === 'VK'){
                                    tdContactValue = createNewElement('span', ['table_contact_value'], 'VK:')
                                    tdContactLink = createNewElement('a', ['table_contact_link','table_contact_link_vk'], data[i].contacts[k].value)
                                    tdContactLink.setAttribute('href', data[i].contacts[k].value)
                                    tdContactLink.setAttribute('target', '_blank')
                                    tdContactValue.append(tdContactLink)
                                } else if (data[i].contacts[k].type == 'facebook') {
                                    tdContactValue = createNewElement('span', ['table_contact_value'], 'FB:')
                                    tdContactLink = createNewElement('a', ['table_contact_link','table_contact_link_vk'], data[i].contacts[k].value)
                                    tdContactLink.setAttribute('href', data[i].contacts[k].value)
                                    tdContactLink.setAttribute('target', '_blank')
                                    tdContactValue.append(tdContactLink)
                                } else {
                                    tdContactValue = createNewElement('div', ['table_contact_value'], data[i].contacts[k].value)
                                }
                                tdContact.append(tdContactValue)
                                switch(data[i].contacts[k].type) {
                                    case 'phone' :
                                        tdContact.classList.add('type_phone')
                                        break
                                    case 'VK' :
                                        tdContact.classList.add('type_VK')
                                        break
                                    case 'facebook' :
                                        tdContact.classList.add('type_facebook')
                                        break
                                    case 'email' :
                                        tdContact.classList.add('type_email')
                                        break
                                    case 'extraPhone' :
                                        tdContact.classList.add('type_extra_phone')
                                }
                                contactContainer.append(tdContact)
                                if (contactContainer.children.length > 4) {
                                    tdContact.classList.add('contact_hidden')
                                    counter++
                                    if(k+1 == data[i].contacts.length) {
                                        const showHiddenContacts = createNewElement('button', ['show_contacts_button'], `+${counter}`)
                                        contactContainer.append(showHiddenContacts)
                                        showHiddenContacts.addEventListener('click', (e)=> {
                                            const contacts = e.path[1].children
                                            for(let contact of contacts) {
                                                contact.classList.remove('contact_hidden')
                                            }
                                            e.path[0].remove()
                                        })
                                    }
                                }
                            }
                            break
                        case 5 :
                            const buttonContainer = createNewElement('div', ['button_container'])
                            const changeButton = createNewElement('button', ['table_td_value','table_change_button_pen', 'table_change_button'], data[i].buttons[0])
                            changeButton.addEventListener('click', ()=>{
                                checkElementForDelete('confirm_background')
                                changeButton.classList.add('table_change_button_loadState')
                                changeButton.classList.remove('table_change_button_pen')
                                changeButton.setAttribute('disabled', '')
                                setTimeout(()=>{
                                    chandeClientInformation(changeButton)
                                    changeButton.removeAttribute('disabled')
                                    changeButton.classList.remove('table_change_button_loadState')
                                    changeButton.classList.add('table_change_button_pen')
                                    if (data[i].contacts.length === 0) {
                                        checkContactsNumber()
                                    }
                                }, 300)
                            })
                            // changeButton.addEventListener('click', chandeClientInformation)
                            buttonContainer.append(changeButton)
                            const deleteButton = createNewElement('button', ['table_td_value','table_delete_button'], data[i].buttons[1])
                            const userId = data[i].id
                            deleteButton.addEventListener('click', ()=>{
                                checkElementForDelete('change_user_form_container')
                                deleteButton.classList.add('table_delete_button_loadState')
                                deleteButton.classList.remove('table_delete_button_pen')
                                deleteButton.setAttribute('disabled', '')
                                setTimeout(()=>{
                                    confirmDelete(userId)
                                    deleteButton.removeAttribute('disabled')
                                    deleteButton.classList.remove('table_delete_button_loadState')
                                    deleteButton.classList.add('table_delete_button_pen')
                                }, 300)
                            })
                            buttonContainer.append(deleteButton)
                            td.append(buttonContainer)
                            break
                    }
                    tr.append(td)
                }
                table.append(tr)
            }
        }

    }

    function getDate(unparsedDate) {
        function addNull(element) {
            if(element < 10) {
                element = '0' + element
            }    
            return element
        }
        const parsedDate = Date.parse(unparsedDate)
        const today = new Date(parsedDate);
        const year = today.getFullYear()
        let month = today.getMonth() + 1
        let day = today.getDate()
        let hours = today.getHours()
        let minutes = today.getMinutes()
        month = addNull(month)
        day = addNull(day)
        hours = addNull(hours)
        minutes = addNull(minutes)
        const fullDate = `${day}.${month}.${year} ${hours}:${minutes}`

        return fullDate
    }

    // Добавление нового пользователя
    function createAddUserButton() {
        const container = getContainer('add_button_container')
        const formContainer = getContainer('user_form_container')
        const addButton = createNewElement('button', ['new_user_button'], 'Добавить клиента')
        container.append(addButton)
        addButton.addEventListener('click', ()=>{
            const form = createUserForm('Новый клиент', 'отменить','','yes')
            formContainer.append(form)
            checkElementForDelete('confirm_background')
            checkContactsNumber()

            form.children[0].children[4].children[0].addEventListener('click', createClient)
        })
    }


    function createUserForm(formHeader, secondButtonText, nameHints = '', inputStar = '') {
        checkElementForDelete('change_user_form_container')
        const formContainer = createNewElement('div', ['change_user_form_container'])
        formContainer.addEventListener('click', (e)=> {
            if(e.path.length === 7) {
                checkElementForDelete('change_user_form_container')
            }
        })
        const form = createNewElement('div', ['add_user_form'])
        formContainer.append(form)
        const container = getContainer('container')
        container.append(formContainer)
        const headerContainer = createNewElement('div', ['header_container'])
        form.append(headerContainer)
        const closeButton = createNewElement('button', ['cancel_button'])
        form.append(closeButton)
        closeButton.addEventListener('click', ()=> {
            checkElementForDelete('change_user_form_container')
        })
        const formHeaderElement = createNewElement('h2', ['form_header'], formHeader)
        headerContainer.append(formHeaderElement)
        const inputContainer = createNewElement('div', ['form_input_container'])
        form.append(inputContainer)
        const surnameContainer = createNewElement('div', ['surname_container'])
        inputContainer.append(surnameContainer)
        if(nameHints === 'yes') {
            const surname = createNewElement('span', ['new_user_hint','new_user_hint_required'],'Фамилия')
            surnameContainer.append(surname)
        }
        const surnameInput = createNewElement('input', ['form_input_surname','form_input'])
        surnameInput.setAttribute('required', '')
        surnameInput.setAttribute('id', 'surnameId')
        surnameInput.placeholder = 'Фамилия'
        if(inputStar !== '') {
            surnameInput.addEventListener('input', ()=> {
                const surnameRed = document.querySelector('.redstar_surname')
                if(surnameInput.value !== '') {
                    surnameRed.style.visibility = 'hidden'
                } else {
                    surnameRed.style.visibility = 'visible'
                }
            })
        }
        surnameContainer.append(surnameInput)
        const spanStarSurname = createNewElement('span',['redstar', 'redstar_surname'],'*')
        surnameContainer.append(spanStarSurname)
        const nameContainer = createNewElement('div', ['name_container'])
        inputContainer.append(nameContainer)
        if(nameHints === 'yes') {
            const name = createNewElement('span', ['new_user_hint','new_user_hint_required'],'Имя')
            nameContainer.append(name)
        }
        const nameInput = createNewElement('input', ['form_input_name','form_input'])
        nameInput.setAttribute('required', '')
        surnameInput.setAttribute('id', 'nameId')
        nameInput.placeholder = 'Имя'
        if(inputStar !== '') {
            nameInput.addEventListener('input', ()=> {
                const surnameRed = document.querySelector('.redstar_name')
                if(nameInput.value !== '') {
                    surnameRed.style.visibility = 'hidden'
                } else {
                    surnameRed.style.visibility = 'visible'
                }
        })
        }
        nameContainer.append(nameInput)
        const spanStarName = createNewElement('span',['redstar', 'redstar_name'],'*')
        nameContainer.append(spanStarName)
        if(nameHints === 'yes') {
            const lastName = createNewElement('span', ['new_user_hint'],'Отчество')
            nameContainer.append(lastName)
        }
        const lastNameInput = createNewElement('input', ['form_input_lastName','form_input'])
        lastNameInput.placeholder = 'Отчество'
        inputContainer.append(lastNameInput)
        const allContactsContainer = createNewElement('div', ['all_contacts'])
        form.append(allContactsContainer)
        const innerContactContainer = createNewElement('div', ['inner_contact_container'])
        allContactsContainer.append(innerContactContainer)
        const addContactButton = createNewElement('button', ['add_contact_button'], 'Добавить контакт')
        allContactsContainer.append(addContactButton)
        addContactButton.addEventListener('click', addContact)
        addContactButton.addEventListener('click', checkContactsNumber)
        const buttonContainer = createNewElement('div', ['form_button_container'])
        form.append(buttonContainer)
        const saveClient = createNewElement('button', ['save_user'], 'Сохранить')
        buttonContainer.append(saveClient)
        const cancelContactButton = createNewElement('button', ['cancel_create_user'], secondButtonText)
        buttonContainer.append(cancelContactButton)
        return formContainer
    }

    function addContact() {
        const contactContainer = createNewElement('div', ['change_contact_container'])
        const form = document.querySelector('.inner_contact_container')
        form.append(contactContainer)
        const contactsSelect = createNewElement('select', ['contacts_select'])
        for (let i = 0; i < 5; i++) {
            switch(i) {
                case 0 :
                    const optionPhone = createNewElement('option', ['contacts_option'], 'Телефон')
                    optionPhone.classList.add('phone')
                    contactsSelect.append(optionPhone)
                    break
                case 1 :
                    const optionExtraPhone = createNewElement('option', ['contacts_option'], 'Доп.телефон')
                    optionExtraPhone.classList.add('extraPhone')
                    contactsSelect.append(optionExtraPhone)
                    break
                case 2 :
                    const optionEmail = createNewElement('option', ['contacts_option'], 'Email')
                    optionEmail.classList.add('email')
                    contactsSelect.append(optionEmail)
                    break
                case 3 :
                    const optionVk =  createNewElement('option', ['contacts_option'], 'Vk')
                    optionVk.classList.add('VK')
                    contactsSelect.append(optionVk)
                    break
                case 4 :
                    const optionFacebook = createNewElement('option', ['contacts_option'], 'Facebook')
                    optionFacebook.classList.add('facebook')
                    contactsSelect.append(optionFacebook)
                    break
            }
        }
        contactContainer.append(contactsSelect)
        const contactInput = createNewElement('input', ['contact_input'])
        contactInput.placeholder = 'Введите данные контакта'
        contactContainer.append(contactInput)
        const deleteContactButton = createNewElement('button', ['delete_button'])
        contactContainer.append(deleteContactButton)
        deleteContactButton.addEventListener('click', function(e) {
            const selectedContact = e.path[1]
            selectedContact.remove()
        })
        deleteContactButton.addEventListener('click', checkContactsNumber)
        return contactContainer
    }

    function checkContactsNumber() {
        const contactsNumber = document.querySelectorAll('.contact_input')
        const addContactButton = document.querySelector('.add_contact_button')
        const allContacts = document.querySelector('.all_contacts')
        if (contactsNumber.length === 10) {
            addContactButton.setAttribute('disabled', '')
        } else if (contactsNumber.length < 11 && contactsNumber.length > 0){
            addContactButton.removeAttribute('disabled')
        }
        if(contactsNumber.length === 0) {
            addContactButton.classList.add('add_contact_button_no_margin')
            allContacts.classList.add('all_contacts_no_padding')
        } else {
            addContactButton.classList.remove('add_contact_button_no_margin')
            allContacts.classList.remove('all_contacts_no_padding')
        }

    }


    function Contact(type, value) {
        this.type = type
        this.value = value
    }

    function createClient() {
        const surname = document.querySelector('.form_input_surname').value
        const name = document.querySelector('.form_input_name').value
        const lastName = document.querySelector('.form_input_lastName').value
        const contacts = createContacts()
        createClientMethod(name, surname, contacts, lastName)
        checkElementForDelete('table_row')
        setTimeout(()=>{
            showTable('','','',true)
            // location.reload()
        }, 100)
        checkElementForDelete('change_user_form_container')
    }  

    function createContacts() {
        const contacts = []
        const contactsValues = document.querySelectorAll('.contact_input')
        const contactsSelectValue = document.querySelectorAll('.contacts_select')
        for (let i = 0; i < contactsValues.length ; i++) {
            let contact
            switch(contactsSelectValue[i].value) {
                case 'Телефон' :
                    contact = new Contact('phone', contactsValues[i].value)
                    break
                case 'Доп.телефон' :
                    contact = new Contact('extraPhone', contactsValues[i].value)
                    break
                case 'Email' :
                    contact = new Contact('email', contactsValues[i].value)
                    break
                case 'Vk' :
                    contact = new Contact('VK', contactsValues[i].value)
                    break
                case 'Facebook' :
                    contact = new Contact('facebook', contactsValues[i].value)
                    break
                }
                contacts.push(contact)
        }
        return contacts
    }

    function checkElementForDelete(element) {
        const checkElement = document.querySelectorAll(`.${element}`)
        if (checkElement.length > 0) {
            for(let i = 0; i < checkElement.length; i++) {
                checkElement[i].remove()
            }
        }
    }
    
     function deleteClient(userId) {
        deleteClientMethod(userId)
        checkElementForDelete('table_row')
        checkElementForDelete('confirm_background')
        setTimeout(()=>{
            showTable('','','',true)
        }, 100)
    }

     async function chandeClientInformation(elementToChange) {
        const form = createUserForm('Изменить данные', 'Удалить клиента', 'yes')
        const userId = elementToChange.parentElement.parentElement.parentElement.children[0].children[0].textContent
        const spanId = createNewElement('span', ['span_id'], `${userId}`)
        const headerContainer = form.children[0].children[0]
        headerContainer.append(spanId)
        const userData = await getClients(userId)

        form.children[0].children[2].children[0].children[1].value = userData.surname
        form.children[0].children[2].children[1].children[1].value = userData.name
        form.children[0].children[2].children[2].value = userData.lastName
        const hints = document.querySelectorAll('.redstar')
        for(let hint of hints) {
            hint.remove()
        }
        let contacts = []
        for(let i = 0; i < userData.contacts.length; i++) {
            let contact = addContact()
            contact.children[1].value = userData.contacts[i].value
            for (let j = 0; j < 5; j++) {
                if(contact.children[0].children[j].classList.contains(userData.contacts[i].type)) {
                    contact.children[0].children[j].setAttribute('selected', '')
                }
            }
        }

        const changeClientButton = form.children[0].children[4].children[0]
        changeClientButton.addEventListener('click', ()=> {
            const surname = form.children[0].children[2].children[0].children[1].value
            const name = form.children[0].children[2].children[1].children[1].value
            const lastName = form.children[0].children[2].children[2].value
            contacts = createContacts()
            changeClientInformation(userId, name, surname, lastName, contacts)
            checkElementForDelete('table_row')
            checkElementForDelete('change_user_form_container')
            setTimeout(()=>{
                showTable('','','',true)
            }, 100)
        })
        const deleteUserButton = form.children[0].children[4].children[1]
        // console.log(deleteUserButton)
        deleteUserButton.addEventListener('click', (e)=> {
            checkElementForDelete('change_user_form_container')
            confirmDelete(userId)
            checkElementForDelete('change_user_form_container')
        })
    }

    function confirmDelete(userId) {
        checkElementForDelete('confirm_background')
        const container = getContainer('confirm_delete_container')
        const background = createNewElement('div', ['confirm_background'])
        container.append(background)
        const innerContainer = createNewElement('div', ['confirm_delete_container_inner'])
        background.append(innerContainer)
        const header = createNewElement('h3', ['confirm_delete_header'], 'Удалить клиента')
        innerContainer.append(header)
        const text = createNewElement('p', ['confirm_delete_text'], 'Вы действительно хотите удалить данного клиента?')
        innerContainer.append(text)
        const deleteButton = createNewElement('button', ['confirm_delete_success'], 'Удалить')
        deleteButton.addEventListener('click', ()=>{
            deleteClient(userId)
        })
        innerContainer.append(deleteButton)
        const cancelButton = createNewElement('button', ['confirm_delete_cancel'], 'Отмена')
        innerContainer.append(cancelButton)
        cancelButton.addEventListener('click', () => {
            checkElementForDelete('confirm_background')
        })
    }

    function sortByField(field, sign) {
        if(sign == 'forward') {
            return(a, b) =>  {
                if (a[field] > b[field]) {
                    return 1;
                  }
                  if (a[field] < b[field]) {
                    return -1;
                  }
                  // a должно быть равным b
                  return 0;
            }  
        } else if(sign = 'reversed') {
            return(a, b) =>  {
                if (a[field] > b[field]) {
                    return -1;
                  }
                  if (a[field] < b[field]) {
                    return 1;
                  }
                  // a должно быть равным b
                  return 0;
            }  
        }
    }

    function startDownload() {
        const container = getContainer('table_container')
        const downloadContainer = createNewElement('div', ['download_container'])
        container.append(downloadContainer)
        setTimeout(()=> {
            downloadContainer.classList.remove('download_container')
            createAddUserButton()
        }, 300)
    }
    
    function pageDownloading() {
        startDownload()
        searchProcessing()
        createTable()
        showTable('','','id')
    }


    pageDownloading()
    // createTable()
})()
