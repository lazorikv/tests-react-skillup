import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Weather } from '../../components/Weather';
import { getWeatherByCity } from '../../services/weatherService';


vi.mock('../../services/weatherService', () => ({
  getWeatherByCity: vi.fn().mockResolvedValue({
    main: {
      temp: 20,
      feels_like: 19,
      humidity: 65,
    },
    weather: [
      {
        description: 'clear sky',
      },
    ],
    name: 'Kyiv',
  }),
}));

describe('Weather', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form with input and button', () => {
        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });

    it('shows loading state when fetching data', async () => {
        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: 'Kyiv'}});
        fireEvent.click(button);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
    });

    it('displays weather data after successful fetch', async () => {
        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: 'Kyiv'}});
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Weather in Kyiv')).toBeInTheDocument();
            expect(screen.getByText('Temperature: 20°C')).toBeInTheDocument();
            expect(screen.getByText('Feels like: 19°C')).toBeInTheDocument();
            expect(screen.getByText('Humidity: 65%')).toBeInTheDocument();
            expect(screen.getByText('Description: clear sky')).toBeInTheDocument();
        });
    });

    it('displays error message when fetch fails', async () => {
        vi.mocked(getWeatherByCity).mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: 'Kyiv'}});
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch weather data')).toBeInTheDocument();
        });
    });

    it('does not fetch data when city is empty', () => {
        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: ''}});
        fireEvent.click(button);

        expect(vi.mocked(getWeatherByCity)).toHaveBeenCalledTimes(1);
    });

    it('displays error message when city does not exist', async () => {
        vi.mocked(getWeatherByCity).mockRejectedValueOnce(new Error('City not found'));

        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: 'NonExistentCity123'}});
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch weather data')).toBeInTheDocument();
        });
    });

    it('shows validation error for numbers', async () => {
        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: '123'}});
        fireEvent.click(button);

        expect(screen.getByText('Please enter a valid city name')).toBeInTheDocument();
        await waitFor(() => {
            expect(vi.mocked(getWeatherByCity)).toHaveBeenCalledTimes(1);
        });
    });

    it('shows validation error for empty spaces', async () => {
        render(<Weather/>);

        const input = screen.getByPlaceholderText('Enter city name');
        const button = screen.getByRole('button', {name: 'Get weather'});

        fireEvent.change(input, {target: {value: '   '}});
        fireEvent.click(button);

        expect(screen.getByText('Please enter a valid city name')).toBeInTheDocument();
        await waitFor(() => {
            expect(vi.mocked(getWeatherByCity)).toHaveBeenCalledTimes(1);
        });
    });
});
