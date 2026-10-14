import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VersionSwitcher } from '../VersionSwitcher';
import { SELECTED_VERSION_PARAM_KEY } from '../../constants';

describe('VersionSwitcher manager toolbar', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders semver-sorted options and auto-selects the latest', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ['1.0.0', '2.0.0', '1.3.0'],
    }));

    render(<VersionSwitcher />);
    const select = await screen.findByRole('combobox', { name: 'Storybook version' });
    await waitFor(() => expect(localStorage.getItem(SELECTED_VERSION_PARAM_KEY)).toBe('2.0.0'));
    expect((select as HTMLSelectElement).value).toBe('2.0.0');
    expect(screen.getAllByRole('option').map((option) => (option as HTMLOptionElement).value))
      .toEqual(['2.0.0', '1.3.0', '1.0.0']);
    vi.unstubAllGlobals();
  });

  it('does not render when the version manifest cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('not found')));
    const { container } = render(<VersionSwitcher />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('select')).toBeNull();
    vi.unstubAllGlobals();
  });
});
