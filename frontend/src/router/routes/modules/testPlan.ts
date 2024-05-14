import { TestPlanRouteEnum } from '@/enums/routeEnum';

import { DEFAULT_LAYOUT } from '../base';
import type { AppRouteRecordRaw } from '../types';

const TestPlan: AppRouteRecordRaw = {
  path: '/test-plan',
  name: TestPlanRouteEnum.TEST_PLAN,
  redirect: '/test-plan/testPlanIndex',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.testPlan',
    icon: 'icon-icon_test-tracking_filled',
    order: 1,
    hideChildrenInMenu: true,
    roles: ['*'],
  },
  children: [
    // 测试计划
    {
      path: 'testPlanIndex',
      name: TestPlanRouteEnum.TEST_PLAN_INDEX,
      component: () => import('@/views/test-plan/testPlan/index.vue'),
      meta: {
        locale: 'menu.testPlan',
        roles: ['*'],
        isTopMenu: true,
      },
    },
    // 测试计划详情
    {
      path: 'testPlanIndexDetail',
      name: TestPlanRouteEnum.TEST_PLAN_INDEX_DETAIL,
      component: () => import('@/views/test-plan/testPlan/detail/index.vue'),
      meta: {
        locale: 'menu.testPlan.testPlanDetail',
        roles: ['PROJECT_TEST_PLAN:READ'],
        breadcrumbs: [
          {
            name: TestPlanRouteEnum.TEST_PLAN_INDEX,
            locale: 'menu.testPlan',
          },
          {
            name: TestPlanRouteEnum.TEST_PLAN_INDEX_DETAIL,
            locale: 'menu.testPlan.testPlanDetail',
          },
        ],
      },
    },
    // 测试计划-测试计划详情-功能用例详情
    {
      path: 'testPlanIndexDetailFeatureCaseDetail',
      name: TestPlanRouteEnum.TEST_PLAN_INDEX_DETAIL_FEATURE_CASE_DETAIL,
      component: () => import('@/views/test-plan/testPlan/detail/featureCase/detail/index.vue'),
      meta: {
        locale: 'menu.testPlan.testPlanDetail',
        roles: ['PROJECT_TEST_PLAN:READ'],
        breadcrumbs: [
          {
            name: TestPlanRouteEnum.TEST_PLAN_INDEX,
            locale: 'menu.testPlan',
          },
          {
            name: TestPlanRouteEnum.TEST_PLAN_INDEX_DETAIL,
            locale: 'menu.testPlan.testPlanDetail',
            isBack: true,
            query: ['id'],
          },
          {
            name: TestPlanRouteEnum.TEST_PLAN_INDEX_DETAIL_FEATURE_CASE_DETAIL,
            locale: 'menu.caseManagement.caseManagementCaseDetail',
          },
        ],
      },
    },
  ],
};

export default TestPlan;
