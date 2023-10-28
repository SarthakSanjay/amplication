import {
  CircularProgress,
  EnumFlexItemMargin,
  EnumItemsAlign,
  EnumTextStyle,
  FlexItem,
  List,
  SearchField,
  Snackbar,
  TabContentTitle,
  Text,
} from "@amplication/ui/design-system";
import React, { useCallback, useEffect, useState } from "react";
import * as models from "../models";
import { formatError } from "../util/error";

import { match } from "react-router-dom";
import { AppRouteProps } from "../routes/routesUtil";
import { pluralize } from "../util/pluralize";
import { ModuleActionListItem } from "./ModuleActionListItem";
import NewModuleAction from "./NewModuleAction";
import useModuleAction from "./hooks/useModuleAction";

const DATE_CREATED_FIELD = "createdAt";

type Props = AppRouteProps & {
  match: match<{
    resource: string;
    module: string;
  }>;
};
const ModuleActionList = React.memo(({ match, innerRoutes }: Props) => {
  const { module: moduleId, resource: resourceId } = match.params;
  const [searchPhrase, setSearchPhrase] = useState<string>("");
  const [error, setError] = useState<Error>();

  const {
    findModuleActions,
    findModuleActionsData: data,
    findModuleActionsError: errorLoading,
    findModuleActionsLoading: loading,
  } = useModuleAction();

  useEffect(() => {
    findModuleActions({
      variables: {
        where: {
          parentBlock: { id: moduleId },
          resource: { id: resourceId },
          displayName:
            searchPhrase !== ""
              ? {
                  contains: searchPhrase,
                  mode: models.QueryMode.Insensitive,
                }
              : undefined,
        },
        orderBy: {
          [DATE_CREATED_FIELD]: models.SortOrder.Asc,
        },
      },
    });
  }, [moduleId, searchPhrase, findModuleActions]);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchPhrase(value);
    },
    [setSearchPhrase]
  );

  const errorMessage =
    formatError(errorLoading) || (error && formatError(error));

  return (
    <>
      {match.isExact ? (
        <>
          <FlexItem
            itemsAlign={EnumItemsAlign.Center}
            start={
              <TabContentTitle
                title="Module Actions"
                subTitle="Actions are used to perform operations on resources, with or without API endpoints."
              />
            }
            end={
              <NewModuleAction resourceId={resourceId} moduleId={moduleId} />
            }
          ></FlexItem>

          <SearchField
            label="search"
            placeholder="Search"
            onChange={handleSearchChange}
          />
          <FlexItem margin={EnumFlexItemMargin.Both}>
            <Text textStyle={EnumTextStyle.Tag}>
              {data?.ModuleActions?.length}{" "}
              {pluralize(data?.ModuleActions?.length, "Action", "Actions")}
            </Text>
          </FlexItem>
          {loading && <CircularProgress centerToParent />}
          <List>
            {data?.ModuleActions?.map((action) => (
              <ModuleActionListItem
                key={action.id}
                moduleId={moduleId}
                moduleAction={action}
                onError={setError}
              />
            ))}
          </List>
          <Snackbar
            open={Boolean(error || errorLoading)}
            message={errorMessage}
          />
        </>
      ) : (
        innerRoutes
      )}
    </>
  );
});

export default ModuleActionList;
