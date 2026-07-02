import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Row, Col, Switch, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { usePoliticianFilterOptions } from '../../hooks/politicians.hook';
import { useDebounce } from '../../hooks/useDebounce';
import { FALLBACK_FILTER_OPTIONS, SCORE_RANGES } from '../../types/fallbackFilterOptions';
import type { PoliticianFilters } from '../../types';

const { Option } = Select;

interface Props {
  filters: PoliticianFilters;
  onFilterChange: (filters: PoliticianFilters) => void;
}

export default function PoliticianFiltersComponent({ filters, onFilterChange }: Props) {
  const { data, isLoading } = usePoliticianFilterOptions();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const filterOptions =
    data?.designations?.length ? data : FALLBACK_FILTER_OPTIONS.politicians;

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onFilterChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    }
  }, [debouncedSearch]); 

  const handleChange = useCallback(
    (key: keyof PoliticianFilters, value: any) => {
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

  const handleClear = useCallback(() => {
    setSearchTerm('');
    onFilterChange({ page: 1, limit: filters.limit || 20 });
  }, [filters.limit, onFilterChange]);

  const getSelectedScoreKey = () =>
    SCORE_RANGES.find(
      r => r.value?.min === filters.minScore && r.value?.max === filters.maxScore
    )?.key;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search politicians..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
            onClear={() => setSearchTerm('')}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Designation"
            value={filters.designation}
            onChange={v => handleChange('designation', v)}
            loading={isLoading && !data}
            allowClear
            className="w-full"
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.designations?.map(d => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Political Leaning"
            value={filters.politicalLeaning}
            onChange={v => handleChange('politicalLeaning', v)}
            loading={isLoading && !data}
            allowClear
            className="w-full"
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.politicalLeanings?.map(l => (
              <Option key={l} value={l}>{l}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Nationality"
            value={filters.nationality}
            onChange={v => handleChange('nationality', v)}
            loading={isLoading && !data}
            allowClear
            className="w-full"
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.nationalities?.map(n => (
              <Option key={n} value={n}>{n}</Option>
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
          <Space>
            <span className="text-sm text-gray-600">In Office:</span>
            <Switch
              checked={!!filters.isInOffice}
              onChange={checked => handleChange('isInOffice', checked ? 1 : undefined)}
            />
          </Space>
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