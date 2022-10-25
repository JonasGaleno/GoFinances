import React, {useState} from 'react';

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

/*Controler do dormulário*/
import { useForm } from 'react-hook-form';

import { Input } from '../../components/Forms/Input';
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
});

export function Register() {
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setcategoryModalOpen] = useState(false);

    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria'
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    function handleTransactionTypeSelect(type: 'up' | 'down'){
        setTransactionType(type);
    }

    function handleCloseSelectCategoryModal(){
        setcategoryModalOpen(false);
    }

    function handleOpenSelectCategoryModal(){
        setcategoryModalOpen(true);
    }

    function handleRegister(form: FormData) {
        if(!transactionType)
            return Alert.alert('Selecione o tipo da transação');

        if(category.key === 'category')
            return Alert.alert('Selecione a categoria');
        
        
        const data = {
            name: form.name,
            amount: form.amount,
            transactionType,
            category: category.key
        }

        console.log(data);
    }

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
                                onPress={() => handleTransactionTypeSelect('up')}
                                isActive={transactionType === 'up'}
                            />
                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() => handleTransactionTypeSelect('down')}
                                isActive={transactionType === 'down'}
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