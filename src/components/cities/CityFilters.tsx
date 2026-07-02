import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useCityFilterOptions } from '../../hooks/cities.hook';
import { useDebounce } from '../../hooks/useDebounce';
import { FALLBACK_FILTER_OPTIONS, PRICE_RANGES, SCORE_RANGES } from '../../types/fallbackFilterOptions';
import type { CityFilters } from '../../types';

const { Option } = Select;

interface Props {
  filters: CityFilters;
  onFilterChange: (filters: CityFilters) => void;
}

export default function CityFiltersComponent({ filters, onFilterChange }: Props) {
  const { data, isLoading } = useCityFilterOptions();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const filterOptions =
    data?.countries?.length ? data : FALLBACK_FILTER_OPTIONS.cities;

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onFilterChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    }
  }, [debouncedSearch]); 

  const handleChange = useCallback(
    (key: keyof CityFilters, value: any) => {
      onFilterChange({ ...filters, [key]: value, page: 1 });
    },
    [filters, onFilterChange]
  );

  const handleScoreRangeChange = useCallback(
    (value: string) => {
      const range = SCORE_RANGES.find(r => r.key === value);
      onFilterChange({
        ...filters,
        minScore: range?.value?.min,
        maxScore: range?.value?.max,
        page: 1,
      });
    },
    [filters, onFilterChange]
  );

  const handlePriceRangeChange = useCallback(
    (value: string) => {
      const range = PRICE_RANGES.find(r => r.key === value);
      onFilterChange({
        ...filters,
        minPrice: range?.value?.min,
        maxPrice: range?.value?.max,
        page: 1,
      });
    },
    [filters, onFilterChange]
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    onFilterChange({ page: 1, limit: filters.limit || 20 });
  }, [filters.limit, onFilterChange]);

  const getSelectedScoreKey = () =>
    SCORE_RANGES.find(
      r => r.value?.min === filters.minScore && r.value?.max === filters.maxScore
    )?.key;

  const getSelectedPriceKey = () =>
    PRICE_RANGES.find(
      r => r.value?.min === filters.minPrice && r.value?.max === filters.maxPrice
    )?.key;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search cities..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
            onClear={() => setSearchTerm('')}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Country"
            value={filters.country}
            onChange={v => handleChange('country', v)}
            loading={isLoading && !data}
            allowClear
            className="w-full"
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.countries?.map(c => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Region"
            value={filters.region}
            onChange={v => handleChange('region', v)}
            loading={isLoading && !data}
            allowClear
            className="w-full"
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.regions?.map(r => (
              <Option key={r} value={r}>{r}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Score Range"
            value={getSelectedScoreKey()}
            onChange={handleScoreRangeChange}
            allowClear
            className="w-full"
          >
            {SCORE_RANGES.map(r => (
              <Option key={r.key} value={r.key}>{r.label}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Price Range"
            value={getSelectedPriceKey()}
            onChange={handlePriceRangeChange}
            allowClear
            className="w-full"
          >
            {PRICE_RANGES.map(r => (
              <Option key={r.key} value={r.key}>{r.label}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
}