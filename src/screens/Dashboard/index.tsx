import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components';

import { useFocusEffect } from '@react-navigation/native';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { useAuth } from '../../hooks/auth';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
} from './styles'

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransactionDate: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  const { signOut, user } = useAuth();
  const theme = useTheme();

  function getLastTransactionDate(collection: DataListProps[], type: 'positive' | 'negative'){
    const collectionFilttered = collection
      .filter(transaction => transaction.type === type); 
    
    if(collectionFilttered.length === 0){
      return 0;
    }

    /*Pegando a maior data*/
    const lastDate = new Date(
     Math.max.apply(Math, collectionFilttered
     .map((transaction) => new Date(transaction.date).getTime())));

    return `${lastDate.getDate()} de ${lastDate.toLocaleString('pt-BR', { month: 'long' })}`;
  }

  async function loadTransaction(){
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    /*Formatando item a item*/
    const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
      
      if(item.type === 'positive'){
        entriesTotal += Number(item.amount);
      }else{
        expensiveTotal += Number(item.amount);
      }
      
      const amount = Number(item.amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      const date = Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).format(new Date(item.date));

      return{
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date
      }
    });

    const total = entriesTotal - expensiveTotal;

    setTransactions(transactionsFormatted);

    const lastTransactionEntriesDate = getLastTransactionDate(transactions, 'positive');
    const lastTransactionExpensiveDate = getLastTransactionDate(transactions, 'negative');
    const totalInterval = lastTransactionExpensiveDate === 0 ? 'Não há transações' : `01 a ${lastTransactionExpensiveDate}`;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransactionDate: lastTransactionEntriesDate === 0 ? 'Não há transações' : `última entrada dia ${lastTransactionEntriesDate}`
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransactionDate: lastTransactionExpensiveDate === 0 ? 'Não há transações' : `última saída dia ${lastTransactionExpensiveDate}`
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransactionDate: totalInterval
      }
    })

    setIsLoading(false);
  }

  // useEffect(() => {
  //   const dataKey = '@gofinances:transactions';
  //   AsyncStorage.removeItem(dataKey);
  // }, [])

  useEffect(() => {
    loadTransaction();
  }, [])

  /*Necessário para carregar a listagem logo após o cadastro da transação*/
  useFocusEffect(useCallback(() => {
    loadTransaction();
  }, []));

  return (
    <Container>
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator 
            color={theme.colors.primary}
            size="large"
          /> 
        </LoadContainer> :
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo 
                  source={{ uri: user.photo }}
                />

                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton
                onPress={signOut}
              >
                <Icon name="power"/>
              </LogoutButton>
              
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              type="up"
              title="Entradas" 
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransactionDate}
            />
            <HighlightCard
              type="down"
              title="Saídas" 
              amount={highlightData.expensives.amount}
              lastTransaction={highlightData.expensives.lastTransactionDate}
            />
            <HighlightCard
              type="total"
              title="Total" 
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransactionDate}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>
            
            <TransactionList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item}/>}
            />
            
          </Transactions>
        </>
      }
    </Container>
  );
};
