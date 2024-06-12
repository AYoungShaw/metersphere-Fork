<template>
  <PlanDetail :detail-info="detail" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { cloneDeep } from 'lodash-es';

  import PlanDetail from '@/views/test-plan/report/detail/component/planDetail.vue';

  import { getReportDetail, planGetShareHref } from '@/api/modules/test-plan/report';
  import { defaultReportDetail } from '@/config/testPlan';
  import { NOT_FOUND_RESOURCE } from '@/router/constants';

  import type { PlanReportDetail } from '@/models/testPlan/testPlanReport';

  const route = useRoute();
  const router = useRouter();
  const reportId = ref<string>(route.query.id as string);

  const detail = ref<PlanReportDetail>(cloneDeep(defaultReportDetail));

  async function getShareDetail() {
    try {
      const hrefShareDetail = await planGetShareHref(route.query.shareId as string);
      reportId.value = hrefShareDetail.reportId;
      if (hrefShareDetail.deleted) {
        router.push({
          name: NOT_FOUND_RESOURCE,
        });
        return;
      }
      detail.value = await getReportDetail(reportId.value, route.query.shareId as string);
    } catch (error) {
      console.log(error);
    }
  }

  watchEffect(() => {
    if (route.query.shareId) {
      getShareDetail();
    }
  });
</script>

<style scoped></style>