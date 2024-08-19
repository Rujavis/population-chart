import React, { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
    ChartTypeRegistry,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const colors = [
    '#F39C12', '#E67E22', '#E74C3C', '#9B59B6', '#8E44AD', // Orange, Red, Purple tones
    '#16A085', '#1ABC9C', '#2ECC71', '#27AE60', '#2C3E50', // Teal, Green tones
    '#F39C12', '#F1C40F', '#E74C3C', '#E67E22', '#D35400'  // More Orange, Red tones
];

const PopulationChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playInterval, setPlayInterval] = useState(null);

    const fetchData = useCallback(() => {
        axios.get('http://localhost:3001/population')
            .then(response => {
                const data = response.data;
                if (!data || data.length === 0) {
                    throw new Error("No data available");
                }

                const years = [...new Set(data.map(item => item.year))].sort();
                setYears(years);
                setData(data);

                if (years.length > 0) {
                    setSelectedYear(years[0]);
                }

                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (isPlaying && years.length > 0) {
            const interval = setInterval(() => {
                setSelectedYear(prevYear => {
                    const currentIndex = years.indexOf(prevYear);
                    const nextIndex = (currentIndex + 1) % years.length;
                    return years[nextIndex];
                });
            }, 2000);
            setPlayInterval(interval);
            return () => clearInterval(interval);
        } else if (!isPlaying && playInterval) {
            clearInterval(playInterval);
            setPlayInterval(null);
        }
    }, [isPlaying, years]);

    useEffect(() => {
        if (data.length > 0 && selectedYear !== null) {
            const countries = [...new Set(data.map(item => item.country))];
            const sortedCountries = countries.sort((a, b) => {
                const popA = data.find(item => item.year === selectedYear && item.country === a)?.population || 0;
                const popB = data.find(item => item.year === selectedYear && item.country === b)?.population || 0;
                return popB - popA; // Sort in descending order
            });

            const datasets = [{
                label: 'Population',
                data: sortedCountries.map(country => data.find(item => item.year === selectedYear && item.country === country)?.population || 0),
                backgroundColor: sortedCountries.map((_, index) => colors[index % colors.length]), // Use fixed color array
                borderWidth: 1,
            }];

            setChartData({
                labels: sortedCountries,
                datasets: datasets
            });
        }
    }, [data, selectedYear]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <div>
                <button onClick={() => setIsPlaying(prev => !prev)}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear || ''}>
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            <Bar
                data={chartData}
                options={{
                    indexAxis: 'y', // Horizontal bar chart
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.dataset.label || '';
                                    const value = context.raw;
                                    return `${label}: ${value}`;
                                }
                            }
                        },
                        datalabels: {
                            color: 'white', // Set data label text color to white
                            anchor: 'end',
                            align: 'start', // Aligns the label to the start of the bar
                            formatter: (value) => value,
                            offset: 10,
                            font: {
                                size: 12 // Adjust font size if needed
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Population'
                            },
                            beginAtZero: true
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Country'
                            },
                            ticks: {
                                autoSkip: false, // Ensure all country names are shown
                                maxRotation: 0, // No rotation for country labels
                                minRotation: 0
                            }
                        }
                    },
                    animation: {
                        duration: 1000, // Adjust animation duration if needed
                        easing: 'easeInOutQuart'
                    }
                }}
            />
        </div>
    );
}

export default PopulationChart;
