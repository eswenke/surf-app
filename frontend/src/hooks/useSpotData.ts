import { useState, useEffect } from 'react';

// Define types for our spot data
export interface Forecast {
  day: string;
  waveHeight: string;
  wind: string;
}

export interface SpotData {
  id: number;
  name: string;
  location: string;
  rating: number;
  waveHeight: string;
  description: string;
  forecast: Forecast[];
}

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
  }
];

export const useSpotData = (spotId: string | undefined) => {
  const [spot, setSpot] = useState<SpotData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchSpotData = () => {
      setLoading(true);
      
      try {
        if (!spotId) {
          throw new Error('No spot ID provided');
        }
        
        const id = parseInt(spotId, 10);
        const foundSpot = mockSpots.find(spot => spot.id === id);
        
        if (!foundSpot) {
          throw new Error(`Spot with ID ${spotId} not found`);
        }
        
        // Simulate API delay
        setTimeout(() => {
          setSpot(foundSpot);
          setLoading(false);
        }, 300);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchSpotData();
  }, [spotId]);

  return { spot, loading, error };
};
