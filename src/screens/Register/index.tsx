import React, { useState, useEffect } from 'react';

/*TouchableWithoutFeedback e Keyboard são utilizados para fechar o teclado ao tocar na tela*/
import { 
    Modal,
    TouchableWithoutFeedback, 
    Keyboard,
    Alert 
} from 'react-native';

/*Validação dos campos do formulário*/
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/*Async Storage, armazenamento local*/
import AsyncStorage from '@react-native-async-storage/async-storage';

import uuid from 'react-native-uuid';

/*Controler do dormulário*/
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import { InputForm } from '../../components/Forms/InputForm';
import { Button } from '../../components/Forms/Button';
import { TransactionTypeButton } from '../../components/Forms/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton';

import { CategorySelect } from '../CategorySelect';

import { 
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionTypes
} from './styles';

interface FormData {
    name: string;
    amount: string;
}

/*Esquema de validação dos campos do formulário*/
const schema = Yup.object().shape({
    name: Yup
        .string()
        .required('Nome é orbigatório'),
    amount: Yup
        .number()
        .typeError('Informe um valor numérico')
        .positive('O valor não pode ser negativo')
        .required('Valor é orbigatório'),
});

export function Register() {
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setcategoryModalOpen] = useState(false);

    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria'
    });

    const navigation = useNavigation();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    function handleTransactionTypeSelect(type: 'positive' | 'negative'){
        setTransactionType(type);
    }

    function handleCloseSelectCategoryModal(){
        setcategoryModalOpen(false);
    }

    function handleOpenSelectCategoryModal(){
        setcategoryModalOpen(true);
    }

    async function handleRegister(form: FormData) {
        if(!transactionType)
            return Alert.alert('Selecione o tipo da transação');

        if(category.key === 'category')
            return Alert.alert('Selecione a categoria');
        
        
        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form.amount,
            type: transactionType,
            category: category.key,
            date: new Date()
        }

        /*Salvando item no AsyncStorage*/
        try {
            const dataKey = '@gofinances:transactions';

            const data = await AsyncStorage.getItem(dataKey);
            const currentData = data ? JSON.parse(data) : [];

            /*Array de objetos, transações*/
            const dataFormatted = [
                ...currentData,
                newTransaction
            ];

            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

            /*Resetando os campos do formulário*/
            reset();
            setTransactionType('');
            setCategory({
                key: 'category',
                name: 'Categoria'
            });
            
            /*Redirecionando após inserir no AsyncStorage*/
            navigation.navigate('Listagem');

        } catch (error) {
            console.log(error);
            Alert.alert("Não foi possível salvar");
        }
    }

    /*
    useEffect(() => {
        ---Recuperando itens no AsyncStorage
        async function loadData(){
            const data = await AsyncStorage.getItem(dataKey);

            console.log(JSON.parse(data!));
        }

        loadData();
        --Removendo todos os itens do AsyncStorage
        async function removeAll(){
            await AsyncStorage.removeItem(dataKey);
        }
        
    }, [])*/

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>

                <Form>
                    <Fields>
                        <InputForm
                            name="name"
                            control={control}
                            placeholder="Nome"
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            error={errors.name && errors.name.message}
                        />
                        <InputForm
                            name="amount"
                            control={control}
                            placeholder="Valor"
                            keyboardType="numeric"
                            error={errors.amount && errors.amount.message}
                        />

                        <TransactionTypes>
                            <TransactionTypeButton
                                type="up"
                                title="Income"
                                onPress={() => handleTransactionTypeSelect('positive')}
                                isActive={transactionType === 'positive'}
                            />
                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() => handleTransactionTypeSelect('negative')}
                                isActive={transactionType === 'negative'}
                            />
                        </TransactionTypes>

                        <CategorySelectButton 
                            title={category.name}
                            onPress={handleOpenSelectCategoryModal}
                        />
                    </Fields>
                    

                    <Button 
                        title="Enviar"
                        onPress={handleSubmit(handleRegister)}
                    />
                </Form>
                
                <Modal visible={categoryModalOpen}>
                    <CategorySelect 
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>

            </Container>
        </TouchableWithoutFeedback>
    )
}