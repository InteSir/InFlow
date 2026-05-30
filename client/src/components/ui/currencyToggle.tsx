import useCurrency from '@/hooks/use-currency';
import { cn } from '@/lib/utils';

const CurrencyToggle = () => {
  const { currency, set } = useCurrency();

  return (
    <div className="space-y-3">
      {/* Heading */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Preferred Currency
        </h3>
        <p className="text-sm text-muted-foreground mb-8">
          Choose how monetary values are displayed across the app.
        </p>
      </div>

      {/* Toggle */}
      <div className="inline-flex items-center rounded-xl border border-border bg-muted p-1 shadow-sm">
        <button
          onClick={() => set('USD')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
            currency === 'USD'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          🇺🇸 USD
        </button>

        <button
          onClick={() => set('BDT')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
            currency === 'BDT'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          🇧🇩 BDT
        </button>
      </div>
    </div>
  );
};

export default CurrencyToggle;