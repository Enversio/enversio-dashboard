import {
  OrderErrorCode,
  useFulfillmentReturnProductsMutation,
  useOrderDetailsQuery,
} from "@saleor/graphql";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { commonMessages } from "@saleor/intl";
import { extractMutationErrors } from "@saleor/misc";
import OrderReturnPage from "@saleor/orders/components/OrderReturnPage";
import { OrderReturnFormData } from "@saleor/orders/components/OrderReturnPage/form";
import { orderUrl } from "@saleor/orders/urls";
import React from "react";
import { useIntl } from "react-intl";

import { messages } from "./messages";
import ReturnFormDataParser from "./utils";

interface OrderReturnProps {
  orderId: string;
}

const OrderReturn: React.FC<OrderReturnProps> = ({ orderId }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();

  const { data } = useOrderDetailsQuery({
    displayLoader: true,
    variables: {
      id: orderId,
    },
  });

  const [returnCreate, returnCreateOpts] = useFulfillmentReturnProductsMutation(
    {
      onCompleted: ({
        orderFulfillmentReturnProducts: { errors, replaceOrder },
      }) => {
        if (!errors.length) {
          notify({
            status: "success",
            text: intl.formatMessage(messages.successAlert),
          });

          navigate(orderUrl(replaceOrder?.id || orderId));

          return;
        }

        if (errors.some(err => err.code === OrderErrorCode.CANNOT_REFUND)) {
          notify({
            autohide: 5000,
            status: "error",
            text: intl.formatMessage(messages.cannotRefundDescription),
            title: intl.formatMessage(messages.cannotRefundTitle),
          });

          return;
        }

        notify({
          autohide: 5000,
          status: "error",
          text: intl.formatMessage(commonMessages.somethingWentWrong),
        });
      },
    },
  );

  const handleSubmit = async (formData: OrderReturnFormData) => {
    if (!data?.order) {
      return;
    }

    return extractMutationErrors(
      returnCreate({
        variables: {
          id: data.order.id,
          input: new ReturnFormDataParser(formData).getParsedData(),
        },
      }),
    );
  };

  return (
    <OrderReturnPage
      errors={returnCreateOpts.data?.orderFulfillmentReturnProducts.errors}
      order={data?.order}
      onSubmit={handleSubmit}
      submitStatus={returnCreateOpts.status}
    />
  );
};

OrderReturn.displayName = "OrderReturn";
export default OrderReturn;
