// app/tabs/dashboard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const budgetData = {
  labels: ['Done', 'Working on it', 'Stuck'],
  datasets: [
    { data: [40, 30, 30] }
  ]
};

const q1StatusData = {
  labels: ['Done', 'Working on it', 'Stuck', 'Ongoing'],
  datasets: [
    { data: [50, 20, 15, 15] }
  ]
};

const topDealsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    { data: [20000, 40000, 30000, 50000, 25000] }
  ]
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo:   '#ffffff',
  decimalPlaces:          0,
  color:           (opacity = 1) => `rgba(76, 139, 245, ${opacity})`,
  labelColor:      (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style:           { borderRadius: 8 },
  propsForBackgroundLines: { strokeDasharray: '' },
};

export default function DashboardScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Budget Allocation */}
      <View style={styles.card}>
        <Text style={styles.title}>Budget Allocation</Text>
        <BarChart
          data={budgetData}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""       // required by TS
          yAxisSuffix=""      // required by TS
          style={styles.chart}
        />
      </View>

      {/* Q1 Status */}
      <View style={styles.card}>
        <Text style={styles.title}>Q1 Status</Text>
        <BarChart
          data={q1StatusData}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""       // required by TS
          yAxisSuffix=""      // required by TS
          style={styles.chart}
        />
      </View>

      {/* Top Deals */}
      <View style={styles.card}>
        <Text style={styles.title}>Top Deals</Text>
        <BarChart
          data={topDealsData}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""       // required by TS
          yAxisSuffix=""      // required by TS
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6f7fb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    // subtle shadow
    shadowColor:   '#000',
    shadowOpacity: 0.05,
    shadowOffset:  { width: 0, height: 2 },
    shadowRadius:  4,
    elevation:     2,
  },
  title: {
    fontSize:   18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  chart: {
    borderRadius: 8,
  },
});
