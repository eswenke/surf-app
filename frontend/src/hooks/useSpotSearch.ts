import { useState, useEffect } from 'react';
import { SpotData } from './useSpotData';

// Mock data - in a real app, this would come from an API
const mockSpots: SpotData[] = [
  {
    id: 1,
    name: 'Malibu Beach',
    location: 'California, USA',
    rating: 4.5,
    waveHeight: '3-4ft',
    description: 'Malibu Beach is a world-famous surf spot known for its perfect right-hand point break. It offers consistent waves that are great for longboarding and is suitable for surfers of all levels.',
    forecast: [
      { day: 'Today', waveHeight: '3-4ft', wind: '5mph' },
      { day: 'Tomorrow', waveHeight: '2-3ft', wind: '8mph' },
      { day: 'Wed', waveHeight: '4-5ft', wind: '3mph' },
      { day: 'Thu', waveHeight: '3-4ft', wind: '6mph' },
      { day: 'Fri', waveHeight: '2-3ft', wind: '7mph' }
    ]
  },
  {
    id: 2,
    name: 'Pipeline',
    location: 'Oahu, Hawaii',
    rating: 5.0,
    waveHeight: '6-8ft',
    description: 'Pipeline is one of the most famous and dangerous waves in the world. Known for its perfect, hollow barrels and powerful waves breaking over a shallow reef, it\'s a proving ground for the world\'s best surfers.',
    forecast: [
      { day: 'Today', waveHeight: '6-8ft', wind: '3mph' },
      { day: 'Tomorrow', waveHeight: '7-9ft', wind: '4mph' },
      { day: 'Wed', waveHeight: '5-7ft', wind: '6mph' },
      { day: 'Thu', waveHeight: '4-6ft', wind: '5mph' },
      { day: 'Fri', waveHeight: '6-8ft', wind: '2mph' }
    ]
  },
  {
    id: 3,
    name: 'Bells Beach',
    location: 'Victoria, Australia',
    rating: 4.2,
    waveHeight: '4-5ft',
    description: 'Home to the world\'s longest-running surf competition, Bells Beach offers powerful, consistent waves that break over a reef-covered point. The iconic right-hand point break is best during winter swells.',
    forecast: [
      { day: 'Today', waveHeight: '4-5ft', wind: '7mph' },
      { day: 'Tomorrow', waveHeight: '3-4ft', wind: '9mph' },
      { day: 'Wed', waveHeight: '5-6ft', wind: '4mph' },
      { day: 'Thu', waveHeight: '4-5ft', wind: '6mph' },
      { day: 'Fri', waveHeight: '3-4ft', wind: '8mph' }
    ]
  },
  {
    id: 4,
    name: 'Pismo Beach',
    location: 'California, USA',
    rating: 3.8,
    waveHeight: '2-3ft',
    description: 'Pismo Beach offers a variety of surf breaks suitable for different skill levels. The pier area provides good protection from wind and creates fun, rideable waves for beginners and intermediate surfers.',
    forecast: [
      { day: 'Today', waveHeight: '2-3ft', wind: '6mph' },
      { day: 'Tomorrow', waveHeight: '3-4ft', wind: '5mph' },
      { day: 'Wed', waveHeight: '2-3ft', wind: '7mph' },
      { day: 'Thu', waveHeight: '1-2ft', wind: '8mph' },
      { day: 'Fri', waveHeight: '2-3ft', wind: '6mph' }
    ]
  },
  {
    id: 5,
    name: 'Morro Bay',
    location: 'California, USA',
    rating: 3.5,
    waveHeight: '3-4ft',
    description: 'Morro Bay offers several surf spots with the iconic Morro Rock as a backdrop. The beach break provides consistent waves and is less crowded than other Central California spots.',
    forecast: [
      { day: 'Today', waveHeight: '3-4ft', wind: '8mph' },
      { day: 'Tomorrow', waveHeight: '4-5ft', wind: '6mph' },
      { day: 'Wed', waveHeight: '3-4ft', wind: '7mph' },
      { day: 'Thu', waveHeight: '2-3ft', wind: '9mph' },
      { day: 'Fri', waveHeight: '3-4ft', wind: '7mph' }
    ]
  },
  {
    id: 6,
    name: 'Avila Beach',
    location: 'California, USA',
    rating: 3.9,
    waveHeight: '2-3ft',
    description: 'Avila Beach is a sheltered cove that offers gentle waves perfect for beginners and longboarders. The protected bay creates clean conditions even when other nearby spots are blown out.',
    forecast: [
      { day: 'Today', waveHeight: '2-3ft', wind: '4mph' },
      { day: 'Tomorrow', waveHeight: '2-3ft', wind: '5mph' },
      { day: 'Wed', waveHeight: '3-4ft', wind: '3mph' },
      { day: 'Thu', waveHeight: '2-3ft', wind: '6mph' },
      { day: 'Fri', waveHeight: '1-2ft', wind: '7mph' }
    ]
  }
];

export const useSpotSearch = (searchTerm: string = '') => {
  const [results, setResults] = useState<SpotData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchSpots = () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call with proper search logic
        setTimeout(() => {
          if (!searchTerm.trim()) {
            setResults([]);
            setLoading(false);
            return;
          }
          
          const term = searchTerm.toLowerCase();
          const filteredSpots = mockSpots.filter(spot => 
            spot.name.toLowerCase().includes(term) || 
            spot.location.toLowerCase().includes(term) ||
            spot.description.toLowerCase().includes(term)
          );
          
          setResults(filteredSpots);
          setLoading(false);
        }, 300); // Simulate API delay
      } catch (err) {
        setError('An error occurred while searching');
        setLoading(false);
      }
    };

    searchSpots();
  }, [searchTerm]);

  return { results, loading, error };
};

export const getAllSpots = (): SpotData[] => {
  return mockSpots;
};
