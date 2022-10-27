import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryPie } from "victory-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "styled-components";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { 
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer
} from "./styles";

import { HistoryCard } from "../../components/HistoryCard";
import { categories } from "../../utils/categories";

interface TransactionData {
    type: 'negative' | 'positive';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData{
    key: string;
    name: string;
    totalGraph: number;
    total: string;
    color: string;
    percent: string;
}

export function Summary(){
    const [selectedDate, setSelectedDate] = useState(new Date);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCategories, setTotalCategories] = useState<CategoryData[]>([]);
    const theme = useTheme();

    function handleDateChange(action: 'next' | 'prev'){
        setIsLoading(true);
        
        if(action === 'next'){
            setSelectedDate(addMonths(selectedDate, 1));
        }else{
            setSelectedDate(subMonths(selectedDate, 1));
        }
    }

    async function loadData(){
        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expensives = responseFormatted.filter((expensive: TransactionData) => 
            expensive.type === 'negative' && 
            new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
            new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
        );

        const totalByCategory: CategoryData[] = [];

        categories.forEach(category => {
            let categorySum = 0;

            expensives.forEach(expensive => {
                if(expensive.category === category.key){
                    categorySum += Number(expensive.amount);
                }
            });

            const expensiveTotal = expensives.reduce((acumulator: number, expensive: TransactionData) => {
                return acumulator + Number(expensive.amount);
            }, 0)

            if(categorySum > 0){
                const total = categorySum.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })

                const percent = `${(categorySum / expensiveTotal * 100).toFixed(0)}%`;

                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    total,
                    color: category.color,
                    totalGraph: categorySum,
                    percent
                });
            }
        });

        setTotalCategories(totalByCategory);
        setIsLoading(false);
    }

    useFocusEffect(useCallback(() => {
        loadData();
      }, [selectedDate]));

    return(
        <Container>
            
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>
            {
                isLoading ? 
                <LoadContainer>
                    <ActivityIndicator 
                        color={theme.colors.primary}
                        size="large"
                    /> 
                </LoadContainer> :

                <Content
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 24, 
                        paddingBottom: useBottomTabBarHeight,
                    }}
                >
                    <MonthSelect>
                        <MonthSelectButton
                            onPress={() => handleDateChange('prev')}
                        >
                            <MonthSelectIcon name="chevron-left"/>
                        </MonthSelectButton>

                        <Month>
                            { format(selectedDate, 'MMMM, yyyy', {locale: ptBR}) }
                        </Month>

                        <MonthSelectButton
                            onPress={() => handleDateChange('next')}
                        >
                            <MonthSelectIcon name="chevron-right"/>
                        </MonthSelectButton>
                    </MonthSelect>

                    <ChartContainer>
                        <VictoryPie
                            data={totalCategories}
                            colorScale={totalCategories.map(category => category.color)}
                            style={{
                                labels: {
                                    fontSize: RFValue(18),
                                    fontWeight: 'bold',
                                    fill: theme.colors.shape
                                }
                            }}
                            labelRadius={50}
                            x="percent"
                            y="total"
                        />
                    </ChartContainer>

                    {
                        totalCategories.map(item => (
                            <HistoryCard
                                key={item.key}
                                title={item.name}
                                amount={item.total}
                                color={item.color}
                            />
                        ))
                    }
                </Content>
            }
        </Container>
    )
}