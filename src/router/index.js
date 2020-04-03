import Vue from 'vue'
import Router from 'vue-router'

// login
import Login from '../components/login/Login'

// error
import E404 from '../components/view/error/404'

// home
import Main from '../components/main/Main'
import Home from '../components/view/home/Home'

// doctor_workstation
import RegistrationList from '../components/view/doctor_workstation/treatment/RegistrationList'
import WesternCommonDiagnose from '../components/view/doctor_workstation/common_diagnose/WesternCommonDiagnose'
import ChineseCommonDiagnose from '../components/view/doctor_workstation/common_diagnose/ChineseCommonDiagnose'
import PerformItem from '../components/view/doctor_workstation/perform_item/PerformItem'
import PerformItemRecord from '../components/view/doctor_workstation/perform_item/PerformItemRecord'
import ClinicalHistoryTemplate from '../components/view/doctor_workstation/templates/ClinicalHistoryTemplate'
import VisitRecord from '../components/view/doctor_workstation/appointment_visit/VisitRecord'

// nurse_workstation
import ChargeFeePrescription from '../components/view/nurse_workstation/charge_fee_prescription/ChargeFeePrescription'
import ChargeFeePosEdit from '../components/view/nurse_workstation/charge_fee_pos/ChargeFeePosEdit'
import PaymentRecord from '../components/view/nurse_workstation/payment_record/PaymentRecord'
import Registration from '../components/view/nurse_workstation/registration/Registration'
import RegistrationRecord from '../components/view/nurse_workstation/registration/RegistrationRecord'
import GoodsOutInventory from '../components/view/nurse_workstation/goods_out_inventory/GoodsOutInventory'
import MemberDeposit from '../components/view/nurse_workstation/member_deposit/MemberDeposit'
import ChargeFeeRecord from '../components/view/nurse_workstation/charge_fee_record/ChargeFeeRecord'
import PerformDrugs from '../components/view/nurse_workstation/perform_drugs/PerformDrugs'

// member_management
import Member from '../components/view/member_management/member/Member'
import Township from '../components/view/member_management/member/Township'
import Committee from '../components/view/member_management/member/Committee'
import MemberType from '../components/view/member_management/member/MemberType'
import HealthArchive from '../components/view/member_management/member_health/HealthArchive'
import ExpendRecord from '../components/view/member_management/deposit_expend_record/ExpendRecord'
import DepositRecord from '../components/view/member_management/deposit_expend_record/DepositRecord'
import PointsRecord from '../components/view/member_management/deposit_expend_record/PointsRecord'

// goods_management
import WesternDrugs from '../components/view/goods_management/goods/WesternDrugs'
import ChineseDrugs from '../components/view/goods_management/goods/ChineseDrugs'
import HygienicMaterial from '../components/view/goods_management/goods/HygienicMaterial'
import GoodsAdjustPriceApply from '../components/view/goods_management/goods_adjust_price/GoodsAdjustPriceApply'
import GoodsAdjustPriceApprove from '../components/view/goods_management/goods_adjust_price/GoodsAdjustPriceApprove'

import GoodsApply from '../components/view/goods_management/goods_apply/GoodsApply'

// purchase_management
import Supplier from '../components/view/purchase_management/supplier/Supplier'
import PurchasePlanApply from '../components/view/purchase_management/purchase_plan/PurchasePlanApply'
import PurchasePlanRecord from '../components/view/purchase_management/purchase_plan/PurchasePlanRecord'
import PurchasePlanApprove from '../components/view/purchase_management/purchase_plan/PurchasePlanApprove'
import PurchaseOrderApply from '../components/view/purchase_management/purchase_order/PurchaseOrderApply'
import PurchaseOrderApprove from '../components/view/purchase_management/purchase_order/PurchaseOrderApprove'
import PurchaseOrderTrack from '../components/view/purchase_management/purchase_order/PurchaseOrderTrack'
import PurchasePlanAddApply from '../components/view/purchase_management/purchase_add/PurchasePlanAddApply'
import PurchaseAloneAddApply from '../components/view/purchase_management/purchase_add/PurchaseAloneAddApply'
import PurchaseAddApprove from '../components/view/purchase_management/purchase_add/PurchaseAddApprove'
import PurchaseSubtractApply from '../components/view/purchase_management/purchase_subtract/PurchaseSubtractApply'
import PurchaseSubtractApprove from '../components/view/purchase_management/purchase_subtract/PurchaseSubtractApprove'

// items_management
import MedicalItem from '../components/view/items_management/item/MedicalItem'
import AdjuvantItem from '../components/view/items_management/item/AdjuvantItem'
import OtherItem from '../components/view/items_management/item/OtherItem'
import NewItemApply from '../components/view/items_management/new_item/NewItemApply'
import NewItemPricing from '../components/view/items_management/new_item/NewItemPricing'
import NewItemApprove from '../components/view/items_management/new_item/NewItemApprove'
import ItemApply from '../components/view/items_management/item_apply/ItemApply'
import ItemAdjustPriceApply from '../components/view/items_management/item_adjust_price/ItemAdjustPriceApply'
import ItemAdjustPriceApprove from '../components/view/items_management/item_adjust_price/ItemAdjustPriceApprove'

// inventory_management
import ClinicPhInventory from '../components/view/inventory_management/inventory/ClinicPhInventory'
import AllPhInventory from '../components/view/inventory_management/inventory/AllPhInventory'
import PchInventory from '../components/view/inventory_management/inventory/PchInventory'
import InventoryAllotApply from '../components/view/inventory_management/inventory_allot/InventoryAllotApply'
import InventoryAllotApprove from '../components/view/inventory_management/inventory_allot/InventoryAllotApprove'
import SelfUsedApply from '../components/view/inventory_management/self_used/SelfUsedApply'
import SelfUsedApprove from '../components/view/inventory_management/self_used/SelfUsedApprove'
import LossApply from '../components/view/inventory_management/inventory_loss/LossApply'
import LossApprove from '../components/view/inventory_management/inventory_loss/LossApprove'
import ShelfPosition from '../components/view/inventory_management/shelf_position/ShelfPosition'
import ShelfGoods from '../components/view/inventory_management/shelf_position/ShelfGoods'
import InventoryCheck from '../components/view/inventory_management/inventory_check/InventoryCheck'

// financial_management
import SupplierAccount from '../components/view/financial_management/supplier_account/SupplierAccount'
import PayableAccount from '../components/view/financial_management/payable_account/PayableAccount'
import PaidAccount from '../components/view/financial_management/paid_account/PaidAccount'
import PaymentApprove from '../components/view/financial_management/payment_approve/PaymentApprove'

// data_report
import AllSellRecord from '../components/view/data_report/sell_record/AllSellRecord'
import ClinicSellRecord from '../components/view/data_report/sell_record/ClinicSellRecord'
import AllSortSellRecord from '../components/view/data_report/sort_sell_record/AllSortSellRecord'
import ClinicSortSellRecord from '../components/view/data_report/sort_sell_record/ClinicSortSellRecord'
import SelfUsedRecord from '../components/view/data_report/self_used_record/SelfUsedRecord'
import LossRecord from '../components/view/data_report/loss_record/LossRecord'
import AllVisitRecord from '../components/view/data_report/visit_record/AllVisitRecord'
import ClinicalHistoryCheck from '../components/view/data_report/clinical_history_check/ClinicalHistoryCheck'
import AllBillingTypeReport from '../components/view/data_report/billing_type_report/AllBillingTypeReport'
import ClinicBillingTypeReport from '../components/view/data_report/billing_type_report/ClinicBillingTypeReport'
import AllPaymentRecordReport from '../components/view/data_report/payment_record_report/AllPaymentRecordReport'
import ClinicPaymentRecordReport from '../components/view/data_report/payment_record_report/ClinicPaymentRecordReport'
import AllDepositPaymentRecordReport from '../components/view/data_report/deposit_payment_record_report/AllDepositPaymentRecordReport'
import ClinicDepositPaymentRecordReport from '../components/view/data_report/deposit_payment_record_report/ClinicDepositPaymentRecordReport'
import AllExpirydateWarning from '../components/view/data_report/expirydate_warning/AllExpirydateWarning'
import ClinicExpirydateWarning from '../components/view/data_report/expirydate_warning/ClinicExpirydateWarning'
import AllLshMarginRate from '../components/view/data_report/lsh_margin_rate/AllLshMarginRate'
import ClinicLshMarginRate from '../components/view/data_report/lsh_margin_rate/ClinicLshMarginRate'
import AllSellFrequency from '../components/view/data_report/sell_frequency/AllSellFrequency'
import ClinicSellFrequency from '../components/view/data_report/sell_frequency/ClinicSellFrequency'
import DaySellRecord from '../components/view/data_report/day_sell_record/DaySellRecord'

// system_management
import Clinic from '../components/view/system_management/sys_setup/Clinic'
import Role from '../components/view/system_management/sys_setup/Role'
import User from '../components/view/system_management/sys_setup/User'
import Authc from '../components/view/system_management/sys_setup/Authc'
import BillingType from '../components/view/system_management/financial_dict/BillingType'
import Gender from '../components/view/system_management/member_dict/Gender'
import ItemUnits from '../components/view/system_management/item_dict/ItemUnits'
import ItemClassify from '../components/view/system_management/item_dict/ItemClassify'
import GoodsUnits from '../components/view/system_management/goods_dict/GoodsUnits'
import DoseUnits from '../components/view/system_management/goods_dict/DoseUnits'
import DoseType from '../components/view/system_management/goods_dict/DoseType'
import DrugFrequency from '../components/view/system_management/goods_dict/DrugFrequency'
import DrugUsage from '../components/view/system_management/goods_dict/DrugUsage'
import Manufacturer from '../components/view/system_management/goods_dict/Manufacturer'
import Origin from '../components/view/system_management/goods_dict/Origin'
import GoodsClassify from '../components/view/system_management/goods_dict/GoodsClassify'
import SellClassify from '../components/view/system_management/goods_dict/SellClassify'
import SpecialDrug from '../components/view/system_management/goods_dict/SpecialDrug'
import StorageTemperature from '../components/view/system_management/goods_dict/StorageTemperature'
import PrescriptionType from '../components/view/system_management/goods_dict/PrescriptionType'
import DrugsPrepareMethod from '../components/view/system_management/goods_dict/DrugsPrepareMethod'
import SecondClassify from '../components/view/system_management/goods_dict/SecondClassify'
import InvoiceType from '../components/view/system_management/financial_dict/InvoiceType'
import PaymentType from '../components/view/system_management/financial_dict/PaymentType'
import PaymentWay from '../components/view/system_management/financial_dict/PaymentWay'
import TaxpayerType from '../components/view/system_management/financial_dict/TaxpayerType'
import Nationality from '../components/view/system_management/member_dict/Nationality'
import Marital from '../components/view/system_management/member_dict/Marital'
import Education from '../components/view/system_management/member_dict/Education'
import BloodType from '../components/view/system_management/member_dict/BloodType'
import Rh from '../components/view/system_management/member_dict/Rh'
import Profession from '../components/view/system_management/member_dict/Profession'
import FFSPaymentWay from '../components/view/system_management/archive_dict/FFSPaymentWay'
import Exposure from '../components/view/system_management/archive_dict/Exposure'
import Allergy from '../components/view/system_management/archive_dict/Allergy'
import Illness from '../components/view/system_management/archive_dict/Illness'
import Disability from '../components/view/system_management/archive_dict/Disability'
import KitchenExhaust from '../components/view/system_management/archive_dict/KitchenExhaust'
import FuelType from '../components/view/system_management/archive_dict/FuelType'
import WaterSource from '../components/view/system_management/archive_dict/WaterSource'
import ToiletType from '../components/view/system_management/archive_dict/ToiletType'
import LivestockFence from '../components/view/system_management/archive_dict/LivestockFence'
import FamilyIllness from '../components/view/system_management/archive_dict/FamilyIllness'
import PracticeType from '../components/view/system_management/other_dict/PracticeType'
import PracticeScope from '../components/view/system_management/other_dict/PracticeScope'
import DoctorTitles from '../components/view/system_management/other_dict/DoctorTitles'

import ClinicRoom from '../components/view/system_management/clinic_setup/ClinicRoom'
import Doctor from '../components/view/system_management/clinic_setup/Doctor'

Vue.use(Router)

export default new Router({
  routes: [
    // login
    {
      path: '/login',
      component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },

    // home
    {
      path: '/main',
      component: Main,
      children: [
        {
          path: 'home',
          component: Home
        }
      ]
    },

    // doctor_workstation
    {
      path: '/main/doctorWorkstation',
      component: Main,
      children: [
        {
          path: 'registrationList',
          component: RegistrationList
        },
        {
          path: 'westernCommonDiagnose',
          component: WesternCommonDiagnose
        },
        {
          path: 'chineseCommonDiagnose',
          component: ChineseCommonDiagnose
        },
        {
          path: 'performItem',
          component: PerformItem
        },
        {
          path: 'performItemRecord',
          component: PerformItemRecord
        },
        {
          path: 'clinicalHistoryTemplate',
          component: ClinicalHistoryTemplate
        },
        {
          path: 'visitRecord',
          component: VisitRecord
        }
      ]
    },

    // nurse_workstation
    {
      path: '/main/nurseWorkstation',
      component: Main,
      children: [
        {
          path: 'chargeFeePrescription',
          component: ChargeFeePrescription
        },
        {
          path: 'chargeFeePosEdit',
          component: ChargeFeePosEdit
        },
        {
          path: 'paymentRecord',
          component: PaymentRecord
        },
        {
          path: 'registration',
          component: Registration
        },
        {
          path: 'registrationRecord',
          component: RegistrationRecord
        },
        {
          path: 'goodsOutInventory',
          component: GoodsOutInventory
        },
        {
          path: 'memberDeposit',
          component: MemberDeposit
        },
        {
          path: 'chargeFeeRecord',
          component: ChargeFeeRecord
        },
        {
          path: 'performDrugs',
          component: PerformDrugs
        }
      ]
    },

    // member_management
    {
      path: '/main/memberManagement',
      component: Main,
      children: [
        {
          path: 'member',
          component: Member
        },
        {
          path: 'township',
          component: Township
        },
        {
          path: 'committee',
          component: Committee
        },
        {
          path: 'memberType',
          component: MemberType
        },
        {
          path: 'healthArchive',
          component: HealthArchive
        },
        {
          path: 'expendRecord',
          component: ExpendRecord
        },
        {
          path: 'depositRecord',
          component: DepositRecord
        },
        {
          path: 'pointsRecord',
          component: PointsRecord
        }
      ]
    },

    // goods_management
    {
      path: '/main/goodsManagement',
      component: Main,
      children: [
        {
          path: 'westernDrugs',
          component: WesternDrugs
        },
        {
          path: 'chineseDrugs',
          component: ChineseDrugs
        },
        {
          path: 'hygienicMaterial',
          component: HygienicMaterial
        },
        {
          path: 'goodsAdjustPriceApply',
          component: GoodsAdjustPriceApply
        },
        {
          path: 'goodsAdjustPriceApprove',
          component: GoodsAdjustPriceApprove
        },
        {
          path: 'goodsApply',
          component: GoodsApply
        }
      ]
    },

    // purchase_management
    {
      path: '/main/purchaseManagement',
      component: Main,
      children: [
        {
          path: 'supplier',
          component: Supplier
        },
        {
          path: 'purchasePlanApply',
          component: PurchasePlanApply
        },
        {
          path: 'purchasePlanRecord',
          component: PurchasePlanRecord
        },
        {
          path: 'purchasePlanApprove',
          component: PurchasePlanApprove
        },
        {
          path: 'purchaseOrderApply',
          component: PurchaseOrderApply
        },
        {
          path: 'purchaseOrderApprove',
          component: PurchaseOrderApprove
        },
        {
          path: 'purchaseOrderTrack',
          component: PurchaseOrderTrack
        },
        {
          path: 'purchaseAloneAddApply',
          component: PurchaseAloneAddApply
        },
        {
          path: 'purchasePlanAddApply',
          component: PurchasePlanAddApply
        },
        {
          path: 'purchaseAddApprove',
          component: PurchaseAddApprove
        },
        {
          path: 'purchaseSubtractApply',
          component: PurchaseSubtractApply
        },
        {
          path: 'purchaseSubtractApprove',
          component: PurchaseSubtractApprove
        }
      ]
    },

    // inventory_management
    {
      path: '/main/inventoryManagement',
      component: Main,
      children: [
        {
          path: 'clinicPhInventory',
          component: ClinicPhInventory
        },
        {
          path: 'allPhInventory',
          component: AllPhInventory
        },
        {
          path: 'pchInventory',
          component: PchInventory
        },
        {
          path: 'inventoryAllotApply',
          component: InventoryAllotApply
        },
        {
          path: 'inventoryAllotApprove',
          component: InventoryAllotApprove
        },
        {
          path: 'selfUsedApply',
          component: SelfUsedApply
        },
        {
          path: 'selfUsedApprove',
          component: SelfUsedApprove
        },
        {
          path: 'lossApply',
          component: LossApply
        },
        {
          path: 'lossApprove',
          component: LossApprove
        },
        {
          path: 'shelfPosition',
          component: ShelfPosition
        },
        {
          path: 'shelfGoods',
          component: ShelfGoods
        },
        {
          path: 'inventoryCheck',
          component: InventoryCheck
        }
      ]
    },

    // items_management
    {
      path: '/main/itemsManagement',
      component: Main,
      children: [
        {
          path: 'medicalItem',
          component: MedicalItem
        },
        {
          path: 'adjuvantItem',
          component: AdjuvantItem
        },
        {
          path: 'otherItem',
          component: OtherItem
        },
        {
          path: 'newItemApply',
          component: NewItemApply
        },
        {
          path: 'newItemPricing',
          component: NewItemPricing
        },
        {
          path: 'newItemApprove',
          component: NewItemApprove
        },
        {
          path: 'itemApply',
          component: ItemApply
        },
        {
          path: 'itemAdjustPriceApply',
          component: ItemAdjustPriceApply
        },
        {
          path: 'itemAdjustPriceApprove',
          component: ItemAdjustPriceApprove
        }
      ]
    },

    // financial_management
    {
      path: '/main/financialManagement',
      component: Main,
      children: [
        {
          path: 'supplierAccount',
          component: SupplierAccount
        },
        {
          path: 'payableAccount',
          component: PayableAccount
        },
        {
          path: 'paidAccount',
          component: PaidAccount
        },
        {
          path: 'paymentApprove',
          component: PaymentApprove
        }
      ]
    },

    // data_record
    {
      path: '/main/dataReport',
      component: Main,
      children: [
        {
          path: 'allSellRecord',
          component: AllSellRecord
        },
        {
          path: 'clinicSellRecord',
          component: ClinicSellRecord
        },
        {
          path: 'allSortSellRecord',
          component: AllSortSellRecord
        },
        {
          path: 'clinicSortSellRecord',
          component: ClinicSortSellRecord
        },
        {
          path: 'selfUsedRecord',
          component: SelfUsedRecord
        },
        {
          path: 'lossRecord',
          component: LossRecord
        },
        {
          path: 'allVisitRecord',
          component: AllVisitRecord
        },
        {
          path: 'clinicalHistoryCheck',
          component: ClinicalHistoryCheck
        },
        {
          path: 'allBillingTypeReport',
          component: AllBillingTypeReport
        },
        {
          path: 'clinicBillingTypeReport',
          component: ClinicBillingTypeReport
        },
        {
          path: 'allPaymentRecordReport',
          component: AllPaymentRecordReport
        },
        {
          path: 'clinicPaymentRecordReport',
          component: ClinicPaymentRecordReport
        },
        {
          path: 'allDepositPaymentRecordReport',
          component: AllDepositPaymentRecordReport
        },
        {
          path: 'clinicDepositPaymentRecordReport',
          component: ClinicDepositPaymentRecordReport
        },
        {
          path: 'allExpirydateWarning',
          component: AllExpirydateWarning
        },
        {
          path: 'clinicExpirydateWarning',
          component: ClinicExpirydateWarning
        },
        {
          path: 'allLshMarginRate',
          component: AllLshMarginRate
        },
        {
          path: 'clinicLshMarginRate',
          component: ClinicLshMarginRate
        },
        {
          path: 'allSellFrequency',
          component: AllSellFrequency
        },
        {
          path: 'clinicSellFrequency',
          component: ClinicSellFrequency
        },
        {
          path: 'daySellRecord',
          component: DaySellRecord
        }
      ]
    },

    // system_management
    {
      path: '/main/systemManagement',
      component: Main,
      children: [
        {
          path: 'clinicRoom',
          component: ClinicRoom
        },
        {
          path: 'doctor',
          component: Doctor
        },

        {
          path: 'clinic',
          component: Clinic
        },
        {
          path: 'role',
          component: Role
        },
        {
          path: 'user',
          component: User
        },
        {
          path: 'authc',
          component: Authc
        },
        {
          path: 'billingType',
          component: BillingType
        },
        {
          path: 'gender',
          component: Gender
        },
        {
          path: 'itemUnits',
          component: ItemUnits
        },
        {
          path: 'itemClassify',
          component: ItemClassify
        },
        {
          path: 'goodsUnits',
          component: GoodsUnits
        },
        {
          path: 'doseUnits',
          component: DoseUnits
        },
        {
          path: 'doseType',
          component: DoseType
        },
        {
          path: 'drugFrequency',
          component: DrugFrequency
        },
        {
          path: 'secondClassify',
          component: SecondClassify
        },
        {
          path: 'drugUsage',
          component: DrugUsage
        },
        {
          path: 'manufacturer',
          component: Manufacturer
        },
        {
          path: 'origin',
          component: Origin
        },
        {
          path: 'goodsClassify',
          component: GoodsClassify
        },
        {
          path: 'sellClassify',
          component: SellClassify
        },
        {
          path: 'specialDrug',
          component: SpecialDrug
        },
        {
          path: 'storageTemperature',
          component: StorageTemperature
        },
        {
          path: 'prescriptionType',
          component: PrescriptionType
        },
        {
          path: 'drugsPrepareMethod',
          component: DrugsPrepareMethod
        },
        {
          path: 'invoiceType',
          component: InvoiceType
        },
        {
          path: 'paymentType',
          component: PaymentType
        },
        {
          path: 'paymentWay',
          component: PaymentWay
        },
        {
          path: 'taxpayerType',
          component: TaxpayerType
        },
        {
          path: 'nationality',
          component: Nationality
        },
        {
          path: 'marital',
          component: Marital
        },
        {
          path: 'education',
          component: Education
        },
        {
          path: 'bloodType',
          component: BloodType
        },
        {
          path: 'rh',
          component: Rh
        },
        {
          path: 'profession',
          component: Profession
        },
        {
          path: 'ffsPaymentWay',
          component: FFSPaymentWay
        },
        {
          path: 'exposure',
          component: Exposure
        },
        {
          path: 'allergy',
          component: Allergy
        },
        {
          path: 'illness',
          component: Illness
        },
        {
          path: 'disability',
          component: Disability
        },
        {
          path: 'kitchenExhaust',
          component: KitchenExhaust
        },
        {
          path: 'fuelType',
          component: FuelType
        },
        {
          path: 'waterSource',
          component: WaterSource
        },
        {
          path: 'toiletType',
          component: ToiletType
        },
        {
          path: 'livestockFence',
          component: LivestockFence
        },
        {
          path: 'familyIllness',
          component: FamilyIllness
        },
        {
          path: 'practiceType',
          component: PracticeType
        },
        {
          path: 'practiceScope',
          component: PracticeScope
        },
        {
          path: 'doctorTitles',
          component: DoctorTitles
        }
      ]
    },

    // error
    {
      path: '/main/error',
      component: Main,
      children: [
        {
          path: '404',
          component: E404
        }
      ]
    }

  ]
})
