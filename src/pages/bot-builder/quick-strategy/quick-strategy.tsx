import React, { useRef, useState } from 'react';
import { Form as FormikForm, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';
import MobileFullPageModal from '@/components/shared_ui/mobile-full-page-modal';
import Modal from '@/components/shared_ui/modal';
import Text from '@/components/shared_ui/text';
import { config as qs_config } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { rudderStackSendCloseEvent } from '../../../analytics/rudderstack-common-events';
import DesktopFormWrapper from './form-wrappers/desktop-form-wrapper';
import MobileFormWrapper from './form-wrappers/mobile-form-wrapper';
import MobileQSFooter from './form-wrappers/mobile-qs-footer';
import { QsSteps } from './form-wrappers/trade-constants';
import LossThresholdWarningDialog from './parts/loss-threshold-warning-dialog';
import { STRATEGIES } from './config';
import Form from './form';
import { TConfigItem, TFormData, TFormValues } from './types';
import './quick-strategy.scss';

type TFormikWrapper = {
    children: React.ReactNode;
};

const getErrorMessage = (dir: 'MIN' | 'MAX', value: number, type = 'DEFAULT') => {
    const errors: { [key: string]: { MIN: string; MAX: string } } = {
        DURATION: {
            MIN: localize('Minimum duration: {{ value }}', { value }),
            MAX: localize('Maximum duration: {{ value }}', { value }),
        },
        LAST_DIGIT_PREDICTION: {
            MIN: localize('Enter a value from {{ value }} to 9.', { value }),
            MAX: localize('Enter a value from 0 to {{ value }}.', { value }),
        },
        DEFAULT: {
            MIN: localize('The value must be equal or greater than {{ value }}', { value }),
            MAX: localize('The value must be equal or less than {{ value }}', { value }),
        },
    };
    return errors[type][dir];
};

const FormikWrapper: React.FC<TFormikWrapper> = observer(({ children }) => {
    const { quick_strategy } = useStore();
    const { selected_strategy, form_data, initializeLossThresholdWarningData } = quick_strategy;
    const config: TConfigItem[][] = STRATEGIES()[selected_strategy]?.fields;
    const [dynamic_schema, setDynamicSchema] = useState(Yup.object().shape({}));
    const is_mounted = useRef(true);

    let initial_value: TFormData | null = null;

    const getSavedValues = () => {
        let data: TFormData | null = null;
        try {
            data = JSON.parse(localStorage.getItem('qs-fields') ?? '{}');
        } catch {
            data = null;
        }
        return data;
    };

    const getInitialValue = () => {
        const data = getSavedValues();
        initial_value = {
            symbol: data?.symbol ?? qs_config().QUICK_STRATEGY.DEFAULT.symbol,
            tradetype: data?.tradetype ?? '',
            type: data?.type ?? '',
            durationtype: data?.durationtype ?? qs_config().QUICK_STRATEGY.DEFAULT.durationtype,
            duration: data?.duration ?? '1',
            stake: data?.stake ?? '1',
            loss: data?.loss ?? '',
            profit: data?.profit ?? '',
            size: data?.size ?? String(qs_config().QUICK_STRATEGY.DEFAULT.size),
            unit: data?.unit ?? String(qs_config().QUICK_STRATEGY.DEFAULT.unit),
            action: data?.action ?? 'RUN',
            max_stake: data?.max_stake ?? 10,
            boolean_max_stake: data?.boolean_max_stake ?? false,
            last_digit_prediction: data?.last_digit_prediction ?? 1,
            growth_rate: data?.growth_rate ?? '0.01',
            tick_count: data?.tick_count ?? 0,
            take_profit: data?.take_profit ?? 0,
            boolean_tick_count: data?.boolean_tick_count ?? false,
            max_payout: data?.max_payout ?? 0,
            max_ticks: data?.max_ticks ?? 0,
        };
        return initial_value;
    };

    React.useEffect(() => {
        return () => {
            is_mounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        initializeLossThresholdWarningData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateSchema = (formikData: TFormData) => {
        const sub_schema: Record<string, any> = {};
        config.forEach(group => {
            if (!group?.length) return null;
            group.forEach(field => {
                if (field?.validation?.length && field?.name) {
                    if (field.validation.includes('number')) {
                        let schema: Record<string, any> = Yup.number().typeError(localize('Must be a number'));
                        let min = 0;
                        let max = 10;
                        let min_error = getErrorMessage('MIN', min);
                        let max_error = getErrorMessage('MAX', max);
                        let integer_error_message = '';
                        const { current_duration_min_max } = quick_strategy;
                        if (field.name === 'duration' && current_duration_min_max) {
                            min = current_duration_min_max.min;
                            max = current_duration_min_max.max;
                            min_error = getErrorMessage('MIN', min, 'DURATION');
                            max_error = getErrorMessage('MAX', max, 'DURATION');
                        }
                        const should_validate = field.should_have
                            ? field.should_have?.every(item => {
                                  const item_value = formikData?.[item.key]?.toString();
                                  if (item.multiple) return item.multiple.includes(item_value);
                                  return formikData?.[item.key] === item.value;
                              })
                            : true;
                        if (should_validate && field.name === 'max_stake') {
                            min = +form_data?.stake;
                            if (isNaN(min)) {
                                min = +(initial_value?.stake ?? 0);
                            }
                            min_error = getErrorMessage('MIN', min);
                        }
                        if (should_validate && field.name === 'last_digit_prediction') {
                            min = 0;
                            max = 9;
                            max_error = getErrorMessage('MAX', max, 'LAST_DIGIT_PREDICTION');
                            integer_error_message = 'Enter a value from 0 to 9.';
                        }
                        if (should_validate) {
                            field.validation.forEach(validation => {
                                if (typeof validation === 'string') {
                                    switch (validation) {
                                        case 'required':
                                            schema = schema.required(localize('Field cannot be empty'));
                                            break;
                                        case 'min':
                                            schema = schema.min(min, min_error);
                                            break;
                                        case 'max':
                                            schema = schema.max(max, max_error);
                                            break;
                                        case 'ceil':
                                            schema = schema.round('ceil');
                                            break;
                                        case 'floor':
                                            schema = schema.round('floor');
                                            break;
                                        case 'integer':
                                            schema = schema.integer(integer_error_message);
                                            break;
                                        default:
                                            break;
                                    }
                                } else if (typeof validation === 'object') {
                                    if (validation?.type) {
                                        // Use dynamic value if available
                                        const value = validation.getDynamicValue
                                            ? validation.getDynamicValue(quick_strategy)
                                            : validation.value;

                                        schema = schema[validation.type](value, localize(validation.getMessage(value)));
                                    }
                                }
                            });
                        }
                        sub_schema[field.name] = schema;
                    }
                }
            });
        });
        if (is_mounted.current) {
            setDynamicSchema(Yup.object().shape(sub_schema));
        }
    };

    const handleSubmit = (form_data: TFormData) => {
        updateSchema(form_data);
        localStorage?.setItem('qs-fields', JSON.stringify(form_data));
        return form_data;
    };

    return (
        <Formik
            initialValues={getInitialValue()}
            validationSchema={dynamic_schema}
            onSubmit={handleSubmit}
            validate={values => updateSchema(values)}
            validateOnChange={false}
        >
            {children}
        </Formik>
    );
});

const QuickStrategy = observer(() => {
    const { quick_strategy } = useStore();
    const { isDesktop } = useDevice();
    const { is_open, setFormVisibility, form_data, selected_strategy } = quick_strategy;

    const active_tab_ref = useRef<HTMLDivElement>(null);
    const [current_step, setCurrentStep] = React.useState(QsSteps.StrategySelect);
    const [selected_trade_type, setSelectedTradeType] = React.useState('');

    const sendRudderStackQsFormCloseData = () => {
        const active_tab =
            active_tab_ref.current?.querySelector('.active')?.textContent?.toLowerCase() === 'learn more'
                ? 'learn more'
                : 'trade parameters';
        rudderStackSendCloseEvent({
            subform_name: 'quick_strategy',
            quick_strategy_tab: active_tab,
            selected_strategy,
            form_values: form_data as TFormValues,
        });
    };

    const handleClose = () => {
        sendRudderStackQsFormCloseData();
        setFormVisibility(false);
    };

    return (
        <FormikWrapper>
            <FormikForm>
                <LossThresholdWarningDialog />
                {isDesktop ? (
                    <Modal className='modal--strategy' is_open={is_open} width='72rem'>
                        <DesktopFormWrapper
                            onClickClose={handleClose}
                            setCurrentStep={setCurrentStep}
                            current_step={current_step}
                            selected_trade_type={selected_trade_type}
                            setSelectedTradeType={setSelectedTradeType}
                        >
                            <Form />
                        </DesktopFormWrapper>
                    </Modal>
                ) : (
                    <>
                        <MobileFullPageModal
                            is_modal_open={is_open}
                            className='quick-strategy__wrapper'
                            header={
                                <Text size='xs' weight='bold'>
                                    {localize(
                                        `Step ${current_step === QsSteps.StrategyCompleted ? 2 : 1}/2: Choose your strategy`
                                    )}
                                </Text>
                            }
                            onClickClose={handleClose}
                            height_offset='8rem'
                        >
                            <MobileFormWrapper
                                setCurrentStep={setCurrentStep}
                                current_step={current_step}
                                selected_trade_type={selected_trade_type}
                                setSelectedTradeType={setSelectedTradeType}
                            >
                                <Form />
                            </MobileFormWrapper>
                        </MobileFullPageModal>
                        <MobileQSFooter setCurrentStep={setCurrentStep} current_step={current_step} />
                    </>
                )}
            </FormikForm>
        </FormikWrapper>
    );
});

export default QuickStrategy;
